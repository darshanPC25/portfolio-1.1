package com.darshanpc.portfolio.admin.auth;

import com.darshanpc.portfolio.entity.AdminUser;
import com.darshanpc.portfolio.repository.AdminUserRepository;
import com.darshanpc.portfolio.security.AdminPrincipal;
import com.darshanpc.portfolio.security.SecurityConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
@Tag(name = "Studio: authentication")
public class AuthController {

    private final AdminAuthService authService;
    private final AdminUserRepository admins;
    private final SecurityContextRepository securityContextRepository;
    private final CsrfTokenRepository csrfTokenRepository;

    @Value("${server.servlet.session.cookie.name:JSESSIONID}")
    private String sessionCookieName;

    @GetMapping("/csrf")
    @Operation(summary = "CSRF token to send in the X-CSRF-TOKEN header of state-changing requests")
    public AuthDtos.CsrfResponse csrf(CsrfToken token) {
        return new AuthDtos.CsrfResponse(token.getHeaderName(), token.getToken());
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in. Starts a server-side session (HttpOnly cookie).")
    public AuthDtos.SessionResponse login(
            @Valid @RequestBody AuthDtos.LoginRequest body, HttpServletRequest request, HttpServletResponse response) {
        AdminUser admin = authService.authenticate(body.email(), body.password(), request.getRemoteAddr());

        // New session id on sign-in (session fixation protection).
        if (request.getSession(false) != null) {
            request.changeSessionId();
        } else {
            request.getSession(true);
        }
        saveAuthentication(admin, request, response);

        // Fresh CSRF token bound to the authenticated session.
        CsrfToken token = csrfTokenRepository.generateToken(request);
        csrfTokenRepository.saveToken(token, request, response);
        return toResponse(admin, token.getToken());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Sign out: the session is destroyed on the server")
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        Cookie expired = new Cookie(sessionCookieName, "");
        expired.setPath("/");
        expired.setHttpOnly(true);
        expired.setMaxAge(0);
        response.addCookie(expired);
    }

    @GetMapping("/me")
    @Operation(summary = "The signed-in administrator")
    public AuthDtos.SessionResponse me(@AuthenticationPrincipal AdminPrincipal principal) {
        AdminUser admin = admins.findById(principal.id())
                .filter(AdminUser::isEnabled)
                .orElseThrow(() -> new org.springframework.security.authentication.InsufficientAuthenticationException(
                        "Account no longer available"));
        return toResponse(admin, null);
    }

    /** Stores (or refreshes) the authenticated administrator in the session. */
    void saveAuthentication(AdminUser admin, HttpServletRequest request, HttpServletResponse response) {
        AdminPrincipal principal = new AdminPrincipal(admin.getId(), admin.getEmail(), admin.getDisplayName());
        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_" + SecurityConfig.ADMIN_ROLE)));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }

    static AuthDtos.SessionResponse toResponse(AdminUser admin, String csrfToken) {
        return new AuthDtos.SessionResponse(
                admin.getId(), admin.getEmail(), admin.getDisplayName(), admin.getLastLoginAt(), csrfToken);
    }
}
