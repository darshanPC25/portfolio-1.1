package com.darshanpc.portfolio.admin.auth;

import com.darshanpc.portfolio.entity.AdminUser;
import com.darshanpc.portfolio.exception.BadRequestException;
import com.darshanpc.portfolio.exception.ConflictException;
import com.darshanpc.portfolio.exception.ResourceNotFoundException;
import com.darshanpc.portfolio.repository.AdminUserRepository;
import com.darshanpc.portfolio.security.AdminPrincipal;
import com.darshanpc.portfolio.security.PasswordPolicy;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** The signed-in administrator's own account (Settings page). */
@RestController
@RequestMapping("/api/v1/admin/account")
@RequiredArgsConstructor
@Tag(name = "Studio: account")
public class AccountController {

    private final AdminUserRepository admins;
    private final PasswordEncoder passwordEncoder;
    private final AuthController authController;

    @PutMapping
    @Transactional
    @Operation(summary = "Change display name and sign-in email (requires the current password)")
    public AuthDtos.SessionResponse update(
            @AuthenticationPrincipal AdminPrincipal principal,
            @Valid @RequestBody AuthDtos.AccountUpdateRequest body,
            HttpServletRequest request,
            HttpServletResponse response) {
        AdminUser admin = current(principal);
        requireCurrentPassword(admin, body.currentPassword());
        String email = body.email().strip();
        if (admins.existsByEmailIgnoreCaseAndIdNot(email, admin.getId())) {
            throw new ConflictException("Another account already uses this email.", "email");
        }
        admin.setEmail(email);
        admin.setDisplayName(body.displayName().strip());
        authController.saveAuthentication(admin, request, response);
        return AuthController.toResponse(admin, null);
    }

    @PutMapping("/password")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Change password (requires the current password)")
    public void changePassword(
            @AuthenticationPrincipal AdminPrincipal principal,
            @Valid @RequestBody AuthDtos.PasswordChangeRequest body,
            HttpServletRequest request) {
        AdminUser admin = current(principal);
        requireCurrentPassword(admin, body.currentPassword());
        PasswordPolicy.problem(body.newPassword()).ifPresent(problem -> {
            throw new BadRequestException(problem, "newPassword");
        });
        if (passwordEncoder.matches(body.newPassword(), admin.getPasswordHash())) {
            throw new BadRequestException("Choose a password different from the current one.", "newPassword");
        }
        admin.setPasswordHash(passwordEncoder.encode(body.newPassword()));
        request.changeSessionId();
    }

    private AdminUser current(AdminPrincipal principal) {
        return admins.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Account", principal.email()));
    }

    private void requireCurrentPassword(AdminUser admin, String currentPassword) {
        if (!passwordEncoder.matches(currentPassword, admin.getPasswordHash())) {
            throw new BadRequestException("The current password is not correct.", "currentPassword");
        }
    }
}
