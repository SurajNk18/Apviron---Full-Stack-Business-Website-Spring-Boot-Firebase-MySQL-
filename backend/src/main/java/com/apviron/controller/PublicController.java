package com.apviron.controller;

import com.apviron.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for public (guest-accessible) page endpoints.
 *
 * These routes are open to everyone — no authentication needed.
 * The frontend HTML pages can call these to verify the backend is running,
 * or to fetch any public data in the future.
 */
@RestController
public class PublicController {

    @GetMapping("/")
    public ResponseEntity<ApiResponse> home() {
        return ResponseEntity.ok(
                ApiResponse.success("Welcome to Apviron — IT Services, Mechanical Solutions & Resource Outsourcing.")
        );
    }

    @GetMapping("/about")
    public ResponseEntity<ApiResponse> about() {
        return ResponseEntity.ok(
                ApiResponse.success("About Apviron — Delivering innovative solutions since inception.")
        );
    }

    @GetMapping("/services")
    public ResponseEntity<ApiResponse> services() {
        return ResponseEntity.ok(
                ApiResponse.success("Apviron Services — IT, Mechanical, and Resource Outsourcing.")
        );
    }

    @GetMapping("/contact")
    public ResponseEntity<ApiResponse> contact() {
        return ResponseEntity.ok(
                ApiResponse.success("Contact Apviron — We'd love to hear from you.")
        );
    }

    @GetMapping("/login")
    public ResponseEntity<ApiResponse> login() {
        return ResponseEntity.ok(
                ApiResponse.success("Please log in to access your dashboard.")
        );
    }

    @GetMapping("/register")
    public ResponseEntity<ApiResponse> register() {
        return ResponseEntity.ok(
                ApiResponse.success("Create your Apviron account.")
        );
    }
}
