package com.app.gestion.ai.security;

import java.util.Set;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserContext {
    private Long userId;
    private String username;
    private Set<String> roles;
    private String domain; // domaine métier de l'utilisateur

    public UserContext(Long userId, Set<String> roles) {
        this.userId = userId;
        this.roles = roles;
    }

    public boolean hasRole(String role) {
        return roles != null && roles.contains(role);
    }
    
    public boolean hasAnyRole(String... rolesToCheck) {
        if (roles == null) return false;
        for (String role : rolesToCheck) {
            if (roles.contains(role)) return true;
        }
        return false;
    }

    public static UserContext fromSecurityContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth != null && auth.isAuthenticated()) {
            Set<String> roles = auth.getAuthorities().stream()
                .map(Object::toString)
                .collect(java.util.stream.Collectors.toSet());
            
            return new UserContext(
                1L, // TODO: extraire l'ID réel de l'utilisateur
                auth.getName(),
                roles,
                "general"
            );
        }
        
        // Fallback pour les tests
        return new UserContext(
            1L,
            "anonymous",
            Set.of("USER"),
            "general"
        );
    }
    
    public static UserContext anonymous() {
        return new UserContext(null, "anonymous", Set.of(), "general");
    }
}
