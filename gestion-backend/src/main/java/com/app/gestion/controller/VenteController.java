package com.app.gestion.controller;

import com.app.gestion.dto.vente.VenteLigneDto;
import com.app.gestion.dto.vente.VenteRequestDto;
import com.app.gestion.dto.vente.VenteResponseDto;
import com.app.gestion.service.VenteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ventes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VenteController {

    private final VenteService venteService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<Page<VenteResponseDto>> getAllVentes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateEntree") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<VenteResponseDto> ventePage = venteService.getAllVentes(pageable);

        return ResponseEntity.ok(ventePage);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<VenteResponseDto> getVenteById(@PathVariable Integer id) {
        VenteResponseDto vente = venteService.getVenteById(id);
        return ResponseEntity.ok(vente);
    }

    /**
     * Créer une commande depuis un pro-forma
     */
    @PostMapping("/from-proforma/{proformaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE')")
    public ResponseEntity<VenteResponseDto> createFromProforma(
            @PathVariable Integer proformaId,
            @Valid @RequestBody VenteRequestDto requestDto) {
        VenteResponseDto created = venteService.createFromProforma(proformaId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Créer une commande directe (sans pro-forma)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<VenteResponseDto> createDirectVente(
            @Valid @RequestBody VenteRequestDto requestDto) {
        VenteResponseDto created = venteService.createDirectVente(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE')")
    public ResponseEntity<VenteResponseDto> updateVente(
            @PathVariable Integer id,
            @Valid @RequestBody VenteRequestDto requestDto) {
        VenteResponseDto updated = venteService.updateVente(id, requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVente(@PathVariable Integer id) {
        venteService.deleteVente(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 3.5 - Valider commercialement une commande
     * Passe de Brouillon (10) à Confirmée (60)
     * Déclenche la réservation de stock
     */
    @PostMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE')")
    public ResponseEntity<VenteResponseDto> validerCommande(@PathVariable Integer id) {
        VenteResponseDto validated = venteService.validerCommande(id);
        return ResponseEntity.ok(validated);
    }

    /**
     * 3.6 - Modifier les lignes d'une commande
     * Autorisé uniquement si process_id < En préparation (70)
     * Recalcule les réservations de stock
     */
    @PutMapping("/{id}/lignes")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<VenteResponseDto> modifierLignesCommande(
            @PathVariable Integer id,
            @Valid @RequestBody List<VenteLigneDto> nouvellesLignes) {
        VenteResponseDto updated = venteService.modifierLignesCommande(id, nouvellesLignes);
        return ResponseEntity.ok(updated);
    }

    /**
     * 3.7 - Annuler une commande
     * Réservé au Responsable ventes (niveau 30-39)
     * Motif obligatoire
     */
    @PostMapping("/{id}/annuler")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE')")
    public ResponseEntity<VenteResponseDto> annulerCommande(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String motif = body.get("motif");
        VenteResponseDto annulee = venteService.annulerCommande(id, motif);
        return ResponseEntity.ok(annulee);
    }
}
