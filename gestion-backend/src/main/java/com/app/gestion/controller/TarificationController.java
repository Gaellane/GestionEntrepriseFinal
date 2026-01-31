package com.app.gestion.controller;

import com.app.gestion.dto.tarification.ArticlePrixRequestDto;
import com.app.gestion.dto.tarification.ArticlePrixResponseDto;
import com.app.gestion.dto.tarification.ArticleTarifHistoriqueDto;
import com.app.gestion.service.TarificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tarification")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TarificationController {

    private final TarificationService tarificationService;

    @GetMapping("/entity/{entityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE', 'RESP_ACHAT', 'EMP_ACHAT', 'RESP_DIRECTION')")
    public ResponseEntity<List<ArticlePrixResponseDto>> getAllPrixByEntity(@PathVariable Integer entityId) {
        List<ArticlePrixResponseDto> prix = tarificationService.getAllPrixByEntityId(entityId);
        return ResponseEntity.ok(prix);
    }

    @GetMapping("/historique/{articleEntityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE', 'RESP_ACHAT', 'EMP_ACHAT', 'RESP_DIRECTION')")
    public ResponseEntity<ArticleTarifHistoriqueDto> getHistoriquePrix(@PathVariable Integer articleEntityId) {
        ArticleTarifHistoriqueDto historique = tarificationService.getHistoriquePrixByArticleEntity(articleEntityId);
        return ResponseEntity.ok(historique);
    }

    @GetMapping("/actuel/{articleEntityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE', 'RESP_ACHAT', 'EMP_ACHAT', 'RESP_DIRECTION')")
    public ResponseEntity<ArticlePrixResponseDto> getPrixActuel(@PathVariable Integer articleEntityId) {
        ArticlePrixResponseDto prix = tarificationService.getPrixActuel(articleEntityId);
        return ResponseEntity.ok(prix);
    }

    @GetMapping("/article/{articleId}/latest")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE', 'RESP_ACHAT', 'EMP_ACHAT', 'RESP_DIRECTION')")
    public ResponseEntity<ArticlePrixResponseDto> getLatestPrixByArticleId(@PathVariable Integer articleId) {
        ArticlePrixResponseDto prix = tarificationService.getLatestPrixByArticleId(articleId);
        return ResponseEntity.ok(prix);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'RESP_ACHAT')")
    public ResponseEntity<Map<String, Object>> ajouterNouveauPrix(
            @Valid @RequestBody ArticlePrixRequestDto requestDto) {
        try {
            ArticlePrixResponseDto createdPrix = tarificationService.ajouterNouveauPrix(requestDto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Nouveau prix ajouté avec succès");
            response.put("data", createdPrix);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{prixId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'RESP_ACHAT')")
    public ResponseEntity<Map<String, Object>> updatePrix(
            @PathVariable Integer prixId,
            @Valid @RequestBody ArticlePrixRequestDto requestDto) {
        try {
            ArticlePrixResponseDto updatedPrix = tarificationService.updatePrix(prixId, requestDto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Prix modifié avec succès");
            response.put("data", updatedPrix);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{prixId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deletePrix(@PathVariable Integer prixId) {
        try {
            tarificationService.deletePrix(prixId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Prix supprimé avec succès");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
