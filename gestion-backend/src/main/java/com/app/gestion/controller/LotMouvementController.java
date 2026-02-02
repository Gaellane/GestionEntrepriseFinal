package com.app.gestion.controller;

import java.util.List;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.gestion.dto.ApiResponse;
import com.app.gestion.dto.stock.ArticleDTO;
import com.app.gestion.dto.stock.DepotDTO;
import com.app.gestion.dto.stock.MovementFormData;
import com.app.gestion.dto.stock.MovementRequest;
import com.app.gestion.dto.stock.LotDTO;
import com.app.gestion.dto.stock.LotMouvementDTO;

import com.app.gestion.service.ArticleService;
import com.app.gestion.service.DepotService;
import com.app.gestion.service.LotService;
import com.app.gestion.service.UtilisateurService;
import com.app.gestion.service.RaisonMouvementService;
import com.app.gestion.dto.stock.TransferLineRequest;
import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/lot-mouvements")
public class LotMouvementController {

    private final LotService lotService;
    private final UtilisateurService utilisateurService;
    private final ArticleService articleService;
    private final DepotService depotService;
    private final RaisonMouvementService raisonMouvementService;

    public LotMouvementController(LotService lotService, UtilisateurService utilisateurService,
            ArticleService articleService, DepotService depotService,
            RaisonMouvementService raisonMouvementService) {
        this.lotService = lotService;
        this.utilisateurService = utilisateurService;
        this.articleService = articleService;
        this.depotService = depotService;
        this.raisonMouvementService = raisonMouvementService;
    }

    @GetMapping("/transfer/form")
    @PreAuthorize("hasAnyAuthority('RESP_MAGASIN','MAGRECEP','MAGSORT','ADMIN')")
    public ApiResponse<MovementFormData> getTransferFormData() {
        try {
            List<com.app.gestion.dto.stock.ArticleDTO> articles = articleService.getAll();
            List<DepotDTO> depots = depotService.getAllForCurrentUser();
            List<com.app.gestion.dto.stock.RaisonMouvementDTO> raisons = raisonMouvementService.getAllRaisons();

            MovementFormData data = MovementFormData.builder()
                    .articles(articles)
                    .depots(depots)
                    .raisons(raisons)
                    .build();

            return new ApiResponse<>(true, "OK", data);
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyAuthority('RESP_MAGASIN','MAGRECEP','MAGSORT','ADMIN')")
    @Transactional
    public ApiResponse<java.util.List<LotDTO>> submitTransfer(
            @org.springframework.web.bind.annotation.RequestBody java.util.List<TransferLineRequest> lines)
            throws Exception {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return new ApiResponse<>(false, "Utilisateur non authentifié", null);
            }

            com.app.gestion.model.Utilisateur utilisateur = utilisateurService.findByEmail(auth.getName());
            Integer userId = utilisateur.getId();

            java.util.List<LotDTO> results = new java.util.ArrayList<>();

            for (TransferLineRequest line : lines) {
                if (line.getQuantite() == null || line.getQuantite() <= 0)
                    continue;
                // use service to transfer (handles splitting across lots)
                java.util.List<com.app.gestion.model.Lot> createdLots = lotService.transfererLots(
                        line.getArticleId(),
                        line.getDepotSourceId(),
                        line.getDepotDestId(),
                        line.getQuantite(),
                        line.getRaisonId(),
                        line.getDescription(),
                        line.getDate() == null ? java.time.LocalDateTime.now() : line.getDate(),
                        userId);

                for (com.app.gestion.model.Lot l : createdLots) {
                    results.add(LotDTO.mapToDTO(l));
                }
            }

            return new ApiResponse<>(true, "OK", results);
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    // POST /saisir removed per request — form will be handled via GET form-data and
    // direct submission elsewhere

    @GetMapping("/saisie")
    @PreAuthorize("hasAnyAuthority('RESP_MAGASIN','MAGRECEP','MAGSORT','ADMIN')")
    public ApiResponse<MovementFormData> getFormData(@RequestParam(value = "type", required = false) Integer type) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Current authentication: " + auth);
            System.out.println("User authorities: " + (auth != null ? auth.getAuthorities() : "null"));

            if (auth == null || auth.getName() == null) {
                System.out.println("User not authenticated");
                return new ApiResponse<>(false, "Utilisateur non authentifié", null);
            }

            System.out.println("Loading form data for type: " + type);

            // load data
            List<ArticleDTO> articles = articleService.getAll();
            int movementType = (type == null) ? 1 : type;
            List<DepotDTO> depots = depotService.getAllForCurrentUser();
            List<com.app.gestion.dto.stock.RaisonMouvementDTO> raisons = raisonMouvementService
                    .getRaisonsForMovement(movementType);

            MovementFormData data = MovementFormData.builder()
                    .articles(articles)
                    .depots(depots)
                    .raisons(raisons)
                    .build();

            System.out.println("Form data loaded successfully");
            return new ApiResponse<>(true, "OK", data);
        } catch (Exception e) {
            System.err.println("Error in getFormData: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    @GetMapping("/by-article/{articleId}")
    @PreAuthorize("hasAnyAuthority('RESP_MAGASIN','MAGRECEP','MAGSORT','ADMIN','MAGINV')")
    public ApiResponse<List<LotMouvementDTO>> getMouvementsByArticle(
            @org.springframework.web.bind.annotation.PathVariable Integer articleId) {
        try {
            System.out.println("=== getMouvementsByArticle called for articleId: " + articleId + " ===");
            List<com.app.gestion.model.LotMouvement> mouvements = lotService.getMouvementsByArticle(articleId);
            System.out.println("Found " + (mouvements != null ? mouvements.size() : 0) + " mouvements");

            List<LotMouvementDTO> dtos = new java.util.ArrayList<>();
            if (mouvements != null) {
                for (com.app.gestion.model.LotMouvement m : mouvements) {
                    try {
                        LotMouvementDTO dto = LotMouvementDTO.mapToDTO(m);
                        dtos.add(dto);
                        System.out.println("Mapped mouvement: id=" + dto.getId() + ", lotNumero=" + dto.getLotNumero()
                                + ", type=" + dto.getTypeMouvement());
                    } catch (Exception e) {
                        System.err.println("Error mapping mouvement id=" + m.getId() + ": " + e.getMessage());
                    }
                }
            }

            System.out.println("Returning " + dtos.size() + " DTOs");
            return new ApiResponse<>(true, "OK", dtos);
        } catch (Exception e) {
            System.err.println("Error in getMouvementsByArticle: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

    @PostMapping("/saisie")
    @PreAuthorize("hasAnyAuthority('RESP_MAGASIN','MAGRECEP','MAGSORT','ADMIN')")
    public ApiResponse<List<LotDTO>> submitMovements(
            @org.springframework.web.bind.annotation.RequestBody List<MovementRequest> requests) throws Exception {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return new ApiResponse<>(false, "Utilisateur non authentifié", null);
            }

            // Debug: log incoming request payload
            System.out.println("submitMovements called with " + (requests == null ? 0 : requests.size()) + " items");
            if (requests != null) {
                for (int i = 0; i < requests.size(); i++) {
                    System.out.println(" request[" + i + "]: " + requests.get(i));
                }
            }

            com.app.gestion.model.Utilisateur utilisateur = utilisateurService.findByEmail(auth.getName());
            Integer userId = utilisateur.getId();

            List<LotDTO> results = new java.util.ArrayList<>();

            for (MovementRequest req : requests) {
                String t = req.getType() == null ? "ENTREE" : req.getType().toUpperCase();
                if ("ENTREE".equals(t)) {
                    com.app.gestion.model.Lot lot = lotService.entrerLot(
                            req.getArticleId(),
                            req.getDepotId(),
                            req.getQuantite(),
                            req.getPrixUnitaire(),
                            req.getRaisonId(),
                            req.getDescription(),
                            req.getDate(),
                            req.getDatePeremption(),
                            userId);
                    LotDTO dto = LotDTO.mapToDTO(lot);
                    results.add(dto);
                    System.out.println("Entrée created: lotId=" + (lot != null ? lot.getId() : null) + ", dto=" + dto);
                } else if ("SORTIE".equals(t)) {
                    List<com.app.gestion.model.Lot> lots = lotService.sortirLots(
                            req.getArticleId(),
                            req.getQuantite(),
                            req.getRaisonId(),
                            req.getDescription(),
                            req.getDate(),
                            userId);
                    for (com.app.gestion.model.Lot l : lots) {
                        LotDTO dto = LotDTO.mapToDTO(l);
                        results.add(dto);
                        System.out.println("Sortie created: lotId=" + (l != null ? l.getId() : null) + ", dto=" + dto);
                    }
                } else {
                    return new ApiResponse<>(false, "Type de mouvement inconnu: " + req.getType(), null);
                }
            }

            System.out.println("submitMovements completed, results size=" + results.size());

            return new ApiResponse<>(true, "OK", results);
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, e.getMessage(), null);
        }
    }

}
