package com.apviron.dto;

import com.apviron.model.Role;

/**
 * Data Transfer Object returned after successful authentication.
 * Contains user info (without the password) and role for frontend redirect logic.
 */
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String redirectUrl;

    // ---- Constructors ----

    public UserResponse() {
    }

    public UserResponse(Long id, String fullName, String email, Role role) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.redirectUrl = determineRedirectUrl(role);
    }

    /**
     * Determines the appropriate dashboard URL based on the user's role.
     */
    private String determineRedirectUrl(Role role) {
        return switch (role) {
            case ADMIN -> "/admin/dashboard";
            case USER -> "/user/dashboard";
        };
    }

    // ---- Getters & Setters ----

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }
}
