package com.app.gestion.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.app.gestion.security.jwt.JwtUtil;
import com.app.gestion.security.service.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        System.out.println("Processing request to: " + request.getRequestURI());
        System.out.println("Auth header: " + authHeader);
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                System.out.println("Token: " + token.substring(0, Math.min(20, token.length())) + "...");
                
                String email = jwtUtil.extractEmail(token);
                System.out.println("Extracted email: " + email);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    System.out.println("User details loaded: " + userDetails.getUsername());
                    System.out.println("User authorities: " + userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(auth);
                    System.out.println("Authentication set successfully for user: " + email);
                }
            } catch (Exception e) {
                System.err.println("JWT Authentication error: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("No Bearer token found");
        }

        chain.doFilter(request, response);
    }

}
