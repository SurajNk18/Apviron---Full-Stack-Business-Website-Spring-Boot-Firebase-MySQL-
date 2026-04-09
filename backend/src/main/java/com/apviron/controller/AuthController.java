package com.apviron.controller;

import com.apviron.dto.ApiResponse;
import com.apviron.dto.LoginRequest;
import com.apviron.dto.RegisterRequest;
import com.apviron.dto.UserResponse;
import com.apviron.model.Role;
import com.apviron.model.User;
import com.apviron.repository.UserRepository;
import com.apviron.service.AuthService;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller handling user authentication.
 *
 * Endpoints:
 *   POST /api/auth/register  — legacy registration (without Firebase)
 *   POST /api/auth/login     — legacy login (without Firebase)
 *   POST /api/auth/verify    — Firebase token verification + role check
 *
 * All endpoints under /api/auth/** are publicly accessible (configured in SecurityConfig).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    // ======================== POST /api/auth/register ========================

    /**
     * Legacy registration endpoint (can be used without Firebase).
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful!", user));
    }

    // ======================== POST /api/auth/login ========================

    /**
     * Legacy login endpoint (can be used without Firebase).
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        UserResponse user = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful!", user));
    }

    // ======================== POST /api/auth/verify ========================

    /**
     * Firebase token verification endpoint.
     *
     * The frontend sends the Firebase ID token after successful
     * Firebase authentication. This endpoint:
     *   1. Verifies the token using Firebase Admin SDK
     *   2. Extracts the user's email from the token
     *   3. Checks if the user exists in MySQL
     *   4. If not, creates a new USER entry (first-time login)
     *   5. Returns user info + role-based redirect URL
     *
     * Request body:
     *   { "idToken": "...", "fullName": "..." (optional, for registration) }
     *
     * Authorization header:
     *   Bearer <idToken>
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verifyFirebaseToken(@RequestBody Map<String, String> body) {
        String idToken = body.get("idToken");
        String fullName = body.get("fullName");

        // Validate token presence
        if (idToken == null || idToken.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Firebase ID token is required."));
        }

        // Check Firebase initialization
        if (FirebaseApp.getApps().isEmpty()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error("Firebase is not configured on the server."));
        }

        try {
            // 1. Verify the Firebase ID token
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();

            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Could not extract email from token."));
            }

            // 2. Check if user exists in MySQL
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // 3. First-time login → Create new USER entry
                user = new User();
                user.setEmail(email);
                user.setFullName(fullName != null && !fullName.isBlank()
                        ? fullName
                        : decodedToken.getName() != null
                            ? decodedToken.getName()
                            : email.split("@")[0]);
                user.setPassword("FIREBASE_AUTH"); // Not used — Firebase handles auth
                user.setRole(Role.USER);
                user = userRepository.save(user);

                System.out.println("✅ New user created from Firebase: " + email);
            }

            // 4. Build response with role-based redirect URL
            UserResponse response = new UserResponse(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole()
            );

            return ResponseEntity.ok(ApiResponse.success("Token verified successfully.", response));

        } catch (FirebaseAuthException e) {
            System.err.println("Firebase token verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid or expired Firebase token."));
        }
    }
}
