package com.darshanpc.portfolio.controller;

import com.darshanpc.portfolio.dto.contact.ContactRequest;
import com.darshanpc.portfolio.dto.contact.ContactSubmissionResponse;
import com.darshanpc.portfolio.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
@Tag(name = "Contact", description = "Public contact form")
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Send a message through the contact form")
    @ApiResponse(responseCode = "202", description = "Message received")
    @ApiResponse(responseCode = "400", description = "Invalid fields; see the errors map")
    @ApiResponse(responseCode = "429", description = "Too many messages from this address; see Retry-After")
    public ContactSubmissionResponse submit(@Valid @RequestBody ContactRequest request, HttpServletRequest http) {
        contactService.submit(request, new ContactService.ClientInfo(
                http.getRemoteAddr(), http.getHeader(HttpHeaders.USER_AGENT)));
        return ContactSubmissionResponse.received();
    }
}
