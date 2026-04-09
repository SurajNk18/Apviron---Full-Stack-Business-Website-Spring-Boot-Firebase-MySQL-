package com.apviron.service;

import com.apviron.model.ContactInquiry;
import com.apviron.repository.ContactInquiryRepository;
import com.apviron.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for managing contact-form inquiries.
 */
@Service
public class ContactService {

    private final ContactInquiryRepository contactRepo;

    public ContactService(ContactInquiryRepository contactRepo) {
        this.contactRepo = contactRepo;
    }

    /**
     * Save a new contact inquiry (public — any guest/user can submit).
     */
    public ContactInquiry submitInquiry(ContactInquiry inquiry) {
        return contactRepo.save(inquiry);
    }

    /**
     * Get all inquiries, newest first (admin only).
     */
    public List<ContactInquiry> getAllInquiries() {
        return contactRepo.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Get only unread inquiries (admin only).
     */
    public List<ContactInquiry> getUnreadInquiries() {
        return contactRepo.findByIsReadFalseOrderByCreatedAtDesc();
    }

    /**
     * Mark an inquiry as read (admin only).
     */
    public ContactInquiry markAsRead(Long id) {
        ContactInquiry inquiry = contactRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with id: " + id));
        inquiry.setRead(true);
        return contactRepo.save(inquiry);
    }

    /**
     * Delete an inquiry (admin only).
     */
    public void deleteInquiry(Long id) {
        if (!contactRepo.existsById(id)) {
            throw new ResourceNotFoundException("Inquiry not found with id: " + id);
        }
        contactRepo.deleteById(id);
    }
}
