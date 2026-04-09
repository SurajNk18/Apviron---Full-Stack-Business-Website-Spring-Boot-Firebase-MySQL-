package com.apviron.repository;

import com.apviron.model.ContactInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Data access layer for ContactInquiry entities.
 */
@Repository
public interface ContactInquiryRepository extends JpaRepository<ContactInquiry, Long> {

    /**
     * Get all unread inquiries, newest first.
     */
    List<ContactInquiry> findByIsReadFalseOrderByCreatedAtDesc();

    /**
     * Get all inquiries ordered by creation date descending.
     */
    List<ContactInquiry> findAllByOrderByCreatedAtDesc();
}
