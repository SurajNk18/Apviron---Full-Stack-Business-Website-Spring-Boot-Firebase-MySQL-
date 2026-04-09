package com.apviron.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

/**
 * Initializes Firebase Admin SDK on application startup.
 *
 * Reads the service account JSON from:
 *   src/main/resources/firebase-service-account.json
 *
 * Steps to set up:
 *   1. Go to Firebase Console → Project Settings → Service Accounts
 *   2. Click "Generate new private key"
 *   3. Save the downloaded JSON file as:
 *      backend/src/main/resources/firebase-service-account.json
 *
 * ⚠ IMPORTANT: Never commit this file to version control!
 *   Add it to .gitignore:  firebase-service-account.json
 */
@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initializeFirebase() {
        try {
            // Check if Firebase is already initialized (prevents duplicate init)
            if (!FirebaseApp.getApps().isEmpty()) {
                System.out.println("ℹ️  Firebase already initialized.");
                return;
            }

            // Load service account from classpath
            InputStream serviceAccount = new ClassPathResource("firebase-service-account.json")
                    .getInputStream();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("✅ Firebase Admin SDK initialized successfully.");

        } catch (IOException e) {
            System.err.println("⚠️  Firebase initialization failed: " + e.getMessage());
            System.err.println("    Make sure firebase-service-account.json exists in src/main/resources/");
            // Don't throw — allow app to start even without Firebase for development
        }
    }
}
