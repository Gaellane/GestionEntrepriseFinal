package com.app.gestion.controller;

import com.app.gestion.dto.ApiResponse;
import com.app.gestion.dto.UtilisateurDto;
import com.app.gestion.service.UtilisateurService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    /**
     * Récupère tous les utilisateurs
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMINSYS')")
    public ApiResponse<List<UtilisateurDto>> getAllUtilisateurs() {
        try {
            System.out.println("[UtilisateurController] Fetching all utilisateurs");
            List<UtilisateurDto> utilisateurs = utilisateurService.getAllUtilisateurs();
            return new ApiResponse<>(true, "OK", utilisateurs);
        } catch (Exception e) {
            System.err.println("[UtilisateurController] Error: " + e.getMessage());
            return new ApiResponse<>(false, "Erreur: " + e.getMessage(), null);
        }
    }

    /**
     * Récupère un utilisateur par ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMINSYS')")
    public ApiResponse<UtilisateurDto> getUtilisateurById(@PathVariable Integer id) {
        try {
            System.out.println("[UtilisateurController] Fetching utilisateur " + id);
            UtilisateurDto utilisateur = utilisateurService.getUtilisateurById(id);
            return new ApiResponse<>(true, "OK", utilisateur);
        } catch (Exception e) {
            System.err.println("[UtilisateurController] Error: " + e.getMessage());
            return new ApiResponse<>(false, "Erreur: " + e.getMessage(), null);
        }
    }

    /**
     * Récupère un utilisateur par email
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMINSYS')")
    public ApiResponse<UtilisateurDto> getUtilisateurByEmail(@PathVariable String email) {
        try {
            System.out.println("[UtilisateurController] Fetching utilisateur by email: " + email);
            UtilisateurDto utilisateur = utilisateurService.getUtilisateurByEmail(email);
            return new ApiResponse<>(true, "OK", utilisateur);
        } catch (Exception e) {
            System.err.println("[UtilisateurController] Error: " + e.getMessage());
            return new ApiResponse<>(false, "Erreur: " + e.getMessage(), null);
        }
    }
}
