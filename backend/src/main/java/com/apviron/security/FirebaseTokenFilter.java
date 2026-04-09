package com.apviron.security;

import com.apviron.model.Role;
import com.apviron.model.User;
import com.apviron.repository.UserRepository;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Security filter that intercepts every request and checks for a
 * Firebase ID token in the Authorization header.
 *
 * Flow:
 *   1. Extract "Bearer <token>" from Authorization header
 *   2. Verify token with Firebase Admin SDK
 *   3. Get email from the decoded token
 *   4. Look up the user in MySQL to determine the role
 *   5. Set Spring Security authentication context
 *
 * If no token is present, the request continues unauthenticated (Guest).
 */
@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    public FirebaseTokenFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Only process if Bearer token is present
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String idToken = authHeader.substring(7);

            try {
                // Check if Firebase is initialized
                if (FirebaseApp.getApps().isEmpty()) {
                    filterChain.doFilter(request, response);
                    return;
                }

                // Verify the Firebase ID token
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                String email = decodedToken.getEmail();

                if (email != null) {
                    // Look up user in MySQL
                    User user = userRepository.findByEmail(email).orElse(null);

                    if (user != null) {
                        // User exists → set auth with their MySQL role
                        Role role = user.getRole();
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        email,
                                        null,
                                        Collections.singletonList(
                                                new SimpleGrantedAuthority("ROLE_" + role.name())
                                        )
                                );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                    // If user not found in MySQL, they remain unauthenticated
                    // (the /api/auth/verify endpoint will create them)
                }

            } catch (FirebaseAuthException e) {
                // Invalid token — continue as unauthenticated (Guest)
                System.err.println("Firebase token verification failed: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
