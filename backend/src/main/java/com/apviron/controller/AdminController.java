package com.apviron.controller;

import com.apviron.dto.ApiResponse;
import com.apviron.model.ContactInquiry;
import com.apviron.model.User;
import com.apviron.repository.UserRepository;
import com.apviron.service.ContactService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Admin-only endpoints.
 *
 * Access rule: /admin/** → requires ROLE_ADMIN (configured in SecurityConfig).
 * An additional @PreAuthorize annotation is added for defence-in-depth.
 */
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ContactService contactService;

    public AdminController(UserRepository userRepository, ContactService contactService) {
        this.userRepository = userRepository;
        this.contactService = contactService;
    }

    // ======================== Dashboard ========================

    /**
     * GET /admin/dashboard
     * Returns a welcome message for the admin dashboard.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse> adminDashboard() {
        return ResponseEntity.ok(
                ApiResponse.success("Welcome to the Admin Dashboard!")
        );
    }

    // ======================== User Management ========================

    /**
     * GET /admin/users
     * Returns a list of all registered users.
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(
                ApiResponse.success("Users retrieved successfully.", users)
        );
    }

    /**
     * GET /admin/users/count
     * Returns total number of registered users.
     */
    @GetMapping("/users/count")
    public ResponseEntity<ApiResponse> getUserCount() {
        long count = userRepository.count();
        return ResponseEntity.ok(
                ApiResponse.success("Total users: " + count, count)
        );
    }

    // ======================== Contact Inquiry Management ========================

    /**
     * GET /admin/inquiries
     * Returns all contact inquiries, newest first.
     */
    @GetMapping("/inquiries")
    public ResponseEntity<ApiResponse> getAllInquiries() {
        List<ContactInquiry> inquiries = contactService.getAllInquiries();
        return ResponseEntity.ok(
                ApiResponse.success("Inquiries retrieved successfully.", inquiries)
        );
    }

    /**
     * GET /admin/inquiries/unread
     * Returns only unread contact inquiries.
     */
    @GetMapping("/inquiries/unread")
    public ResponseEntity<ApiResponse> getUnreadInquiries() {
        List<ContactInquiry> inquiries = contactService.getUnreadInquiries();
        return ResponseEntity.ok(
                ApiResponse.success("Unread inquiries retrieved.", inquiries)
        );
    }

    /**
     * PUT /admin/inquiries/{id}/read
     * Mark a specific inquiry as read.
     */
    @PutMapping("/inquiries/{id}/read")
    public ResponseEntity<ApiResponse> markInquiryAsRead(@PathVariable Long id) {
        ContactInquiry inquiry = contactService.markAsRead(id);
        return ResponseEntity.ok(
                ApiResponse.success("Inquiry marked as read.", inquiry)
        );
    }

    /**
     * DELETE /admin/inquiries/{id}
     * Delete a specific inquiry.
     */
    @DeleteMapping("/inquiries/{id}")
    public ResponseEntity<ApiResponse> deleteInquiry(@PathVariable Long id) {
        contactService.deleteInquiry(id);
        return ResponseEntity.ok(
                ApiResponse.success("Inquiry deleted successfully.")
        );
    }
}
