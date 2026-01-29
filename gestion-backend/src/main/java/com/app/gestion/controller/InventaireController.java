package com.app.gestion.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.gestion.dto.ApiResponse;
import com.app.gestion.dto.stock.InventaireDTO;
import com.app.gestion.dto.stock.InventaireLigneRequest;
import com.app.gestion.model.Inventaire;
import com.app.gestion.model.Utilisateur;
import com.app.gestion.service.InventaireService;
import com.app.gestion.service.UtilisateurService;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/inventaires")
public class InventaireController {

    private final InventaireService inventaireService;
    private final UtilisateurService utilisateurService;

    public InventaireController(InventaireService inventaireService, UtilisateurService utilisateurService) {
        this.inventaireService = inventaireService;
        this.utilisateurService = utilisateurService;
    }

    @PostMapping("/demandes")
    @PreAuthorize("hasAnyAuthority('MAGINV','MAGRECEP','MAGSORT','ADMIN')")
    public ApiResponse<InventaireDTO> createDemande(@RequestBody Map<String, Object> body) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return new ApiResponse<>(false, "Utilisateur non authentifié", null);
            }
            Utilisateur u = utilisateurService.findByEmail(auth.getName());
            Object depotObj = body.get("depotId");
            Integer depotId = null;
            if (depotObj instanceof Number) {
                depotId = ((Number) depotObj).intValue();
            } else if (depotObj instanceof String) {
                try {
                    depotId = Integer.parseInt((String) depotObj);
                } catch (NumberFormatException nfe) {
                    return new ApiResponse<>(false, "Identifiant de dépôt invalide", null);
                }
            } else if (depotObj == null) {
                return new ApiResponse<>(false, "Veuillez fournir depotId", null);
            } else {
                return new ApiResponse<>(false, "Identifiant de dépôt de type inattendu", null);
            }

            String details = (String) body.getOrDefault("details", "");

            Inventaire inv = inventaireService.createRequest(u.getId(), depotId, details);
            InventaireDTO dto = InventaireDTO.fromEntity(inv, null);
            return new ApiResponse<>(true, "Demande créée", dto);
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('MAGRECEP','MAGSORT','RESP_MAGASIN','ADMIN')")
    public ApiResponse<java.util.List<InventaireDTO>> listDemandes() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return new ApiResponse<>(false, "Utilisateur non authentifié", null);
            }

            // If the current user is MAGINV, return only their demandes
            boolean isMagInv = auth.getAuthorities().stream().anyMatch(a -> "MAGINV".equals(a.getAuthority()));
            if (isMagInv) {
                Utilisateur u = utilisateurService.findByEmail(auth.getName());
                java.util.List<InventaireDTO> list = inventaireService.listDemandesForUser(u.getId());
                return new ApiResponse<>(true, "OK", list);
            } else {
                java.util.List<InventaireDTO> list = inventaireService.listDemandes();
                return new ApiResponse<>(true, "OK", list);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    @PostMapping("/{id}/validate")
    @PreAuthorize("hasAnyAuthority('RESP_MAGASIN','ADMIN')")
    public ApiResponse<InventaireDTO> validateDemande(@PathVariable("id") Integer id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return new ApiResponse<>(false, "Utilisateur non authentifié", null);
            }
            Utilisateur u = utilisateurService.findByEmail(auth.getName());
            Inventaire inv = inventaireService.validateRequest(id, u.getId());
            InventaireDTO dto = InventaireDTO.fromEntity(inv, null);
            return new ApiResponse<>(true, "Demande validée", dto);
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    @PostMapping("/perform")
    @PreAuthorize("hasAnyAuthority('MAGINV','MAGRECEP','MAGSORT','ADMIN')")
    public ApiResponse<java.util.List<com.app.gestion.model.InventaireLigne>> performInventaire(@RequestBody InventaireLigneRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return new ApiResponse<>(false, "Utilisateur non authentifié", null);
            }

            java.util.List<com.app.gestion.model.InventaireLigne> saved = inventaireService.addLignesToInventaire(request);
            return new ApiResponse<>(true, "Lignes d'inventaire enregistrées", saved);
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
}
