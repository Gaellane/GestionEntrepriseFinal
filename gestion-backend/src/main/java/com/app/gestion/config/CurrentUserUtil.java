package com.app.gestion.config;

import com.app.gestion.model.Utilisateur;
import com.app.gestion.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserUtil {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public Utilisateur getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        Object principal = authentication.getPrincipal();
        String email;
        
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            email = (String) principal;
        } else {
            return null;
        }
        
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + email));
    }

    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            return (String) principal;
        }
        
        return null;
    }

    public boolean hasRole(String roleCode) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> 
                    grantedAuthority.getAuthority().equals(roleCode));
    }

    // Récupérer l'ID de l'utilisateur
    public Integer getCurrentUserId() {
        Utilisateur user = getCurrentUser();
        return user != null ? user.getId() : null;
    }
}