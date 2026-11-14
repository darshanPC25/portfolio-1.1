package com.darshanpc.portfolio.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.csrf.CsrfException;
import org.springframework.stereotype.Component;

/** 401 / 403 responses as problem JSON, matching the rest of the API. */
@Component
@RequiredArgsConstructor
public class ProblemSecurityHandlers implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException ex)
            throws IOException {
        write(response, HttpStatus.UNAUTHORIZED, "Not signed in", "Please sign in to continue.", null);
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException ex)
            throws IOException {
        if (ex instanceof CsrfException) {
            // The SPA reacts to this code by fetching a fresh token and retrying once.
            write(response, HttpStatus.FORBIDDEN, "Invalid security token",
                    "Your session token is missing or out of date. Please try again.", "csrf");
            return;
        }
        write(response, HttpStatus.FORBIDDEN, "Forbidden", "You do not have access to this resource.", null);
    }

    private void write(HttpServletResponse response, HttpStatus status, String title, String detail, String code)
            throws IOException {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        if (code != null) {
            problem.setProperty("code", code);
        }
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), problem);
    }
}
