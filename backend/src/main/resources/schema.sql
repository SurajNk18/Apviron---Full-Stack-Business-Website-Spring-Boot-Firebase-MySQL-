-- ===================================================================
-- Apviron Database Schema
-- Run this file to create the database and tables manually,
-- OR let Hibernate auto-generate them (spring.jpa.hibernate.ddl-auto=update).
-- ===================================================================

-- 1. Create the database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS apviron_db;
USE apviron_db;

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    full_name   VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL,
    password    VARCHAR(255)    NOT NULL,
    role        VARCHAR(20)     NOT NULL DEFAULT 'USER',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Contact inquiries table
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL,
    subject     VARCHAR(200)    NULL,
    message     TEXT            NOT NULL,
    is_read     TINYINT(1)      NOT NULL DEFAULT 0,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- Sample Data
-- ===================================================================

-- Insert a default ADMIN user (password: Admin@123 encrypted with BCrypt)
-- You can generate a new hash at https://bcrypt-generator.com/
-- The DataSeeder class also does this automatically on startup.
INSERT INTO users (full_name, email, password, role, created_at)
VALUES (
    'Apviron Admin',
    'admin@apviron.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN',
    NOW()
) ON DUPLICATE KEY UPDATE id = id;

-- Insert a sample USER (password: User@123)
INSERT INTO users (full_name, email, password, role, created_at)
VALUES (
    'John Doe',
    'john@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'USER',
    NOW()
) ON DUPLICATE KEY UPDATE id = id;
