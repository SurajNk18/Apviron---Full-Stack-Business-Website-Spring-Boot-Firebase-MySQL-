package com.apviron.controller;

import com.apviron.dto.ApiResponse;
import com.apviron.model.User;
import com.apviron.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authenticated User endpoints.
 *
 * Access rule: /user/** → requires ROLE_USER (configured in SecurityConfig).
 */
@RestController
@RequestMapping("/user")
@PreAuthorize("hasRole('USER')")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ======================== Dashboard ========================

    /**
     * GET /user/dashboard
     * Returns a welcome message for the user dashboard.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse> userDashboard(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        String name = (user != null) ? user.getFullName() : "User";
        return ResponseEntity.ok(
                ApiResponse.success("Welcome to your dashboard, " + name + "!")
        );
    }

    // ======================== Profile ========================

    /**
     * GET /user/profile
     * Returns the currently authenticated user's profile.
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Build a safe response (exclude password)
        var profile = new java.util.LinkedHashMap<String, Object>();
        profile.put("id", user.getId());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(
                ApiResponse.success("Profile retrieved successfully.", profile)
        );
    }
}
