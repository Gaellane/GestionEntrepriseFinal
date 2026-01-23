package com.app.gestion.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.gestion.dto.ApiResponse;
import com.app.gestion.dto.stock.ArticleDTO;
import com.app.gestion.dto.stock.DepotDTO;
import com.app.gestion.dto.stock.MovementFormData;
 
import com.app.gestion.model.Lot;
import com.app.gestion.model.Utilisateur;
import com.app.gestion.service.ArticleService;
import com.app.gestion.service.DepotService;
import com.app.gestion.service.LotService;
import com.app.gestion.service.UtilisateurService;

@RestController
@RequestMapping("/api/lot-mouvements")
public class LotMouvementController {

    private final LotService lotService;
    private final UtilisateurService utilisateurService;
    private final ArticleService articleService;
    private final DepotService depotService;

    public LotMouvementController(LotService lotService, UtilisateurService utilisateurService, ArticleService articleService, DepotService depotService) {
        this.lotService = lotService;
        this.utilisateurService = utilisateurService;
        this.articleService = articleService;
        this.depotService = depotService;
    }

    // POST /saisir removed per request — form will be handled via GET form-data and direct submission elsewhere

    @GetMapping("/saisie")
    @PreAuthorize("hasAnyAuthority('RESP_MAGASIN','MAGRECEPT','MAGSORT','ADMIN')")
    public ApiResponse<MovementFormData> getFormData(@RequestParam(value = "type", required = false) Integer type) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return new ApiResponse<>(false, "Utilisateur non authentifié", null);
            }

            // load data
            List<ArticleDTO> articles = articleService.getAll();
            int movementType = (type == null) ? 1 : type;
            List<DepotDTO> depots = depotService.getDepotsForMovement(movementType);

            MovementFormData data = MovementFormData.builder()
                    .articles(articles)
                    .depots(depots)
                    .build();

            return new ApiResponse<>(true, "OK", data);
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }
}
