package com.darshanpc.portfolio.dto.contact;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "ContactSubmissionResponse")
public record ContactSubmissionResponse(String message) {

    public static ContactSubmissionResponse received() {
        return new ContactSubmissionResponse("Thank you — your message has been received.");
    }
}
