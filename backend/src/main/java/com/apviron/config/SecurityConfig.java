package com.apviron.config;

import com.apviron.security.CustomAccessDeniedHandler;
import com.apviron.security.CustomAuthenticationEntryPoint;
import com.apviron.security.CustomUserDetailsService;
import com.apviron.security.FirebaseTokenFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Central Spring Security configuration — now integrated with Firebase Auth.
 *
 * Authentication flow:
 *   1. Frontend authenticates via Firebase (email + password)
 *   2. Frontend sends Firebase ID token in Authorization header
 *   3. FirebaseTokenFilter verifies the token & sets SecurityContext
 *   4. Spring Security enforces role-based access rules
 *
 * Route access rules:
 *   PUBLIC  — /, /about, /services, /contact, /login, /register, /api/auth/**, /api/contact/submit
 *   ADMIN   — /admin/**
 *   USER    — /user/**
 *   GUEST   — any unauthenticated visitor (not a stored role)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final CustomAuthenticationEntryPoint authEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final FirebaseTokenFilter firebaseTokenFilter;

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          CustomAuthenticationEntryPoint authEntryPoint,
                          CustomAccessDeniedHandler accessDeniedHandler,
                          FirebaseTokenFilter firebaseTokenFilter) {
        this.userDetailsService = userDetailsService;
        this.authEntryPoint = authEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
        this.firebaseTokenFilter = firebaseTokenFilter;
    }

    // ===================== Security Filter Chain =====================

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Enable CORS with our config
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Disable CSRF for stateless REST API
                .csrf(csrf -> csrf.disable())

                // Route authorization rules
                .authorizeHttpRequests(auth -> auth
                        // --- Public routes (Guest-accessible) ---
                        .requestMatchers(
                                "/",
                                "/about",
                                "/services",
                                "/contact",
                                "/login",
                                "/register",
                                "/api/auth/**",
                                "/api/contact/submit"
                        ).permitAll()

                        // --- Admin routes ---
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // --- User routes ---
                        .requestMatchers("/user/**").hasRole("USER")

                        // --- Everything else requires authentication ---
                        .anyRequest().authenticated()
                )

                // Custom JSON error responses instead of default redirects
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )

                // Stateless — no server-side session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Add Firebase token filter BEFORE Spring's default auth filter
                .addFilterBefore(firebaseTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ===================== Beans =====================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // ===================== CORS =====================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
