package com.apviron.controller;

import com.apviron.dto.ApiResponse;
import com.apviron.model.ContactInquiry;
import com.apviron.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for the public contact form.
 *
 * POST /api/contact/submit is publicly accessible so that
 * any visitor (guest, user, or admin) can send an inquiry.
 */
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    /**
     * POST /api/contact/submit
     * Accepts a contact form submission from any visitor.
     */
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse> submitInquiry(@Valid @RequestBody ContactInquiry inquiry) {
        ContactInquiry saved = contactService.submitInquiry(inquiry);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Thank you! Your inquiry has been submitted successfully.", saved));
    }
}
