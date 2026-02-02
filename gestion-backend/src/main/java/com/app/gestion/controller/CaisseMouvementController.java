package com.app.gestion.controller;

import com.app.gestion.model.CaisseMouvement;
import com.app.gestion.service.CaisseMouvementService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class CaisseMouvementController {

    private final CaisseMouvementService caisseMouvementService;

    @PostMapping("/api/caisse-mouvements/encaisser-vente")
    public ResponseEntity<?> encaisserVente(@RequestBody EncaissementRequest request) {
        try {
            CaisseMouvement cm = caisseMouvementService.encaisserVente(
                    request.getVenteId(),
                    request.getMontant(),
                    request.getTypeMouvementId(),
                    request.getEntityId(),
                    request.getDetails()
            );
            return ResponseEntity.ok(cm);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/api/caisse-mouvements")
    public ResponseEntity<?> createMouvement(@RequestBody CreateMouvementRequest request) {
        try {
            CaisseMouvement cm = caisseMouvementService.createMouvement(
                    request.getVenteId(),
                    request.getMontant(),
                    request.getTypeMouvementId(),
                    request.getEntityId(),
                    request.getDetails()
            );
            return ResponseEntity.ok(cm);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/api/caisse-mouvements/vente/{venteId}")
    public ResponseEntity<List<CaisseMouvement>> getMouvementsByVente(@PathVariable Integer venteId) {
        try {
            List<CaisseMouvement> mouvements = caisseMouvementService.getMouvementsByVente(venteId);
            return ResponseEntity.ok(mouvements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @Data
    public static class EncaissementRequest {
        private Integer venteId;
        private Double montant;
        private Integer typeMouvementId;
        private Integer entityId;
        private String details;
    }

    @Data
    public static class CreateMouvementRequest {
        private Integer venteId;
        private Double montant;
        private Integer typeMouvementId;
        private Integer entityId;
        private String details;
    }
}
