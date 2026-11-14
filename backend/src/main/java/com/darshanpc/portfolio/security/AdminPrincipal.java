package com.darshanpc.portfolio.security;

import java.io.Serializable;
import java.security.Principal;
import java.util.UUID;

/** The signed-in administrator, stored in the HTTP session. */
public record AdminPrincipal(UUID id, String email, String displayName) implements Principal, Serializable {

    @Override
    public String getName() {
        return email;
    }
}
