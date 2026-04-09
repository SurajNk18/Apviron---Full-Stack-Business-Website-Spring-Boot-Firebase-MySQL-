package com.apviron.config;

import com.apviron.model.Role;
import com.apviron.model.User;
import com.apviron.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds an initial ADMIN user on application startup if one doesn't already exist.
 *
 * Default admin credentials:
 *   Email:    admin@apviron.com
 *   Password: Admin@123
 *
 * ⚠ IMPORTANT: Change these credentials in production!
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Only seed if admin doesn't already exist
        String adminEmail = "admin@apviron.com";

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setFullName("Apviron Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);
            System.out.println("✅ Default admin user created: " + adminEmail);
        } else {
            System.out.println("ℹ️  Admin user already exists. Skipping seed.");
        }
    }
}
