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
                    request.getDetails());
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
                    request.getDetails());
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

    @GetMapping("/api/caisse-mouvements")
    public ResponseEntity<List<CaisseMouvement>> getAllMouvements() {
        try {
            List<CaisseMouvement> mouvements = caisseMouvementService.getAllMouvements();
            return ResponseEntity.ok(mouvements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/api/caisse-mouvements/solde")
    public ResponseEntity<?> getSolde() {
        try {
            Double solde = caisseMouvementService.getMontantEnCaisse();
            return ResponseEntity.ok(java.util.Map.of("solde", solde));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/api/caisse-mouvements/stats")
    public ResponseEntity<?> getStats(
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin) {
        try {
            java.time.LocalDateTime debut = dateDebut != null
                    ? java.time.LocalDate.parse(dateDebut).atStartOfDay()
                    : java.time.LocalDate.now().withDayOfMonth(1).atStartOfDay();
            java.time.LocalDateTime fin = dateFin != null
                    ? java.time.LocalDate.parse(dateFin).atTime(23, 59, 59)
                    : java.time.LocalDateTime.now();

            Double encaissements = caisseMouvementService.getEncaissements(debut, fin);
            Double remboursements = caisseMouvementService.getRemboursements(debut, fin);
            Double solde = caisseMouvementService.getMontantEnCaisse();
            List<Object[]> parType = caisseMouvementService.getMouvementsParType(debut, fin);

            java.util.List<java.util.Map<String, Object>> parTypeList = parType.stream()
                    .map(row -> java.util.Map.<String, Object>of("type", row[0], "total", row[1]))
                    .toList();

            return ResponseEntity.ok(java.util.Map.of(
                    "solde", solde,
                    "encaissements", encaissements,
                    "remboursements", remboursements,
                    "parType", parTypeList));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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
