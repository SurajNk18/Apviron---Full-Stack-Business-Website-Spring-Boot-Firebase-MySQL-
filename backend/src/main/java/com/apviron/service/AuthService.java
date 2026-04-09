package com.apviron.service;

import com.apviron.dto.LoginRequest;
import com.apviron.dto.RegisterRequest;
import com.apviron.dto.UserResponse;
import com.apviron.exception.EmailAlreadyExistsException;
import com.apviron.exception.InvalidCredentialsException;
import com.apviron.model.Role;
import com.apviron.model.User;
import com.apviron.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service handling user registration and login logic.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new user with the USER role.
     *
     * @param request registration payload
     * @return UserResponse with redirect URL based on role
     * @throws EmailAlreadyExistsException if email is taken
     */
    public UserResponse register(RegisterRequest request) {
        // 1. Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(
                    "An account with email '" + request.getEmail() + "' already exists.");
        }

        // 2. Create user entity
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER); // Public registration always assigns USER

        // 3. Persist
        User savedUser = userRepository.save(user);

        // 4. Build response
        return new UserResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    /**
     * Authenticate a user by email and password.
     *
     * @param request login payload
     * @return UserResponse with redirect URL based on role
     * @throws InvalidCredentialsException if credentials are wrong
     */
    public UserResponse login(LoginRequest request) {
        // 1. Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

        // 2. Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        // 3. Build response (includes role-based redirect URL)
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
