package com.darshanpc.portfolio.admin.messages;

import com.darshanpc.portfolio.entity.ContactMessage;
import com.darshanpc.portfolio.entity.enums.ContactMessageStatus;
import com.darshanpc.portfolio.exception.ResourceNotFoundException;
import com.darshanpc.portfolio.repository.ContactMessageRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Inbox for messages sent through the public contact form. */
@Validated
@RestController
@RequestMapping("/api/v1/admin/messages")
@RequiredArgsConstructor
@Tag(name = "Studio: messages")
public class MessageAdminController {

    private final ContactMessageRepository messages;
    private final Clock clock;

    public record MessageResponse(
            UUID id,
            String name,
            String email,
            String subject,
            String message,
            ContactMessageStatus status,
            Instant receivedAt,
            Instant readAt) {
    }

    public record MessagePage(List<MessageResponse> items, long total, int page, int size) {
    }

    public record StatusRequest(@NotNull ContactMessageStatus status) {
    }

    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "Messages, newest first, optionally filtered by status")
    public MessagePage list(
            @RequestParam(required = false) ContactMessageStatus status,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        PageRequest request = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ContactMessage> result = status == null ? messages.findAll(request) : messages.findByStatus(status, request);
        return new MessagePage(result.map(MessageAdminController::toResponse).getContent(),
                result.getTotalElements(), page, size);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public MessageResponse get(@PathVariable UUID id) {
        return toResponse(find(id));
    }

    @PatchMapping("/{id}")
    @Transactional
    @Operation(summary = "Mark as new, read or archived")
    public MessageResponse setStatus(@PathVariable UUID id, @Valid @RequestBody StatusRequest body) {
        ContactMessage message = find(id);
        message.setStatus(body.status());
        if (body.status() == ContactMessageStatus.NEW) {
            message.setReadAt(null);
        } else if (message.getReadAt() == null) {
            message.setReadAt(clock.instant());
        }
        return toResponse(message);
    }

    @DeleteMapping("/{id}")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        messages.delete(find(id));
    }

    private ContactMessage find(UUID id) {
        return messages.findById(id).orElseThrow(() -> new ResourceNotFoundException("Message", id.toString()));
    }

    private static MessageResponse toResponse(ContactMessage m) {
        return new MessageResponse(m.getId(), m.getName(), m.getEmail(), m.getSubject(), m.getMessage(),
                m.getStatus(), m.getCreatedAt(), m.getReadAt());
    }
}
