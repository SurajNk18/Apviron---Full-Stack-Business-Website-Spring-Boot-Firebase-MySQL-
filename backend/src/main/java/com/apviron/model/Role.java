package com.apviron.model;

/**
 * Enum representing user roles in the system.
 * 
 * NOTE: "Guest" is NOT a stored role — it simply means
 * the visitor is unauthenticated.
 */
public enum Role {
    USER,
    ADMIN
}
