package com.app.gestion.controller;

import com.app.gestion.dto.ApiResponse;
import com.app.gestion.dto.RolesAttributionHistoriqueDto;
import com.app.gestion.model.Utilisateur;
import com.app.gestion.service.RolesAttributionService;
import com.app.gestion.service.UtilisateurService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roles-attribution")
@RequiredArgsConstructor
public class RolesAttributionController {

    private final RolesAttributionService rolesAttributionService;
    private final UtilisateurService utilisateurService;


    @PostMapping("/assign")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMINSYS')")
    public ApiResponse<RolesAttributionHistoriqueDto> assignRole(
            @RequestParam Integer utilisateurId,
            @RequestParam Integer roleId) {
        try {

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return new ApiResponse<>(false, "Utilisateur non authentifié", null);
            }

            Utilisateur u = utilisateurService.findByEmail(auth.getName());


            System.out.println("[RolesAttributionController] Assigning role " + roleId + " to user " + utilisateurId);
            RolesAttributionHistoriqueDto result = rolesAttributionService.assignRole(utilisateurId, roleId, u.getId());
            return new ApiResponse<>(true, "Rôle assigné avec succès", result);
        } catch (Exception e) {
            System.err.println("[RolesAttributionController] Error: " + e.getMessage());
            return new ApiResponse<>(false, "Erreur: " + e.getMessage(), null);
        }
    }

    @PostMapping("/validate/{historiqueId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMINSYS')")
    public ApiResponse<RolesAttributionHistoriqueDto> validateAttribution(
            @PathVariable Integer historiqueId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return new ApiResponse<>(false, "Utilisateur non authentifié", null);
            }

            Utilisateur u = utilisateurService.findByEmail(auth.getName());


            System.out.println("[RolesAttributionController] Validating attribution " + historiqueId);
            RolesAttributionHistoriqueDto result = rolesAttributionService.validateRoleAttribution(historiqueId, u.getId());
            return new ApiResponse<>(true, "Attribution validée avec succès", result);
        } catch (Exception e) {
            System.err.println("[RolesAttributionController] Error: " + e.getMessage());
            return new ApiResponse<>(false, "Erreur: " + e.getMessage(), null);
        }
    }

    @PostMapping("/reject/{historiqueId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMINSYS')")
    public ApiResponse<RolesAttributionHistoriqueDto> rejectAttribution(
            @PathVariable Integer historiqueId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return new ApiResponse<>(false, "Utilisateur non authentifié", null);
            }

            Utilisateur u = utilisateurService.findByEmail(auth.getName());


            System.out.println("[RolesAttributionController] Rejecting attribution " + historiqueId);
            RolesAttributionHistoriqueDto result = rolesAttributionService.rejectRoleAttribution(historiqueId, u.getId());
            return new ApiResponse<>(true, "Attribution rejetée avec succès", result);
        } catch (Exception e) {
            System.err.println("[RolesAttributionController] Error: " + e.getMessage());
            return new ApiResponse<>(false, "Erreur: " + e.getMessage(), null);
        }
    }

    @GetMapping("/by-process/{processId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMINSYS')")
    public ApiResponse<List<RolesAttributionHistoriqueDto>> getAttributionsByProcess(
            @PathVariable Integer processId) {
        try {
            System.out.println("[RolesAttributionController] Fetching attributions by process " + processId);
            List<RolesAttributionHistoriqueDto> attributions = rolesAttributionService.getAttributionsByProcess(processId);
            return new ApiResponse<>(true, "OK", attributions);
        } catch (Exception e) {
            System.err.println("[RolesAttributionController] Error: " + e.getMessage());
            return new ApiResponse<>(false, "Erreur: " + e.getMessage(), null);
        }
    }

    @GetMapping("/by-user/{utilisateurId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMINSYS')")
    public ApiResponse<List<RolesAttributionHistoriqueDto>> getAttributionsByUser(
            @PathVariable Integer utilisateurId) {
        try {
            System.out.println("[RolesAttributionController] Fetching attributions for user " + utilisateurId);
            List<RolesAttributionHistoriqueDto> attributions = rolesAttributionService.getAttributionsByUser(utilisateurId);
            return new ApiResponse<>(true, "OK", attributions);
        } catch (Exception e) {
            System.err.println("[RolesAttributionController] Error: " + e.getMessage());
            return new ApiResponse<>(false, "Erreur: " + e.getMessage(), null);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMINSYS')")
    public ApiResponse<RolesAttributionHistoriqueDto> getAttributionById(
            @PathVariable Integer id) {
        try {
            System.out.println("[RolesAttributionController] Fetching attribution " + id);
            RolesAttributionHistoriqueDto attribution = rolesAttributionService.getAttributionById(id);
            return new ApiResponse<>(true, "OK", attribution);
        } catch (Exception e) {
            System.err.println("[RolesAttributionController] Error: " + e.getMessage());
            return new ApiResponse<>(false, "Erreur: " + e.getMessage(), null);
        }
    }
}
