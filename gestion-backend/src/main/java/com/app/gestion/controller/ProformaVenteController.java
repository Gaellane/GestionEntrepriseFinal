package com.app.gestion.controller;

import com.app.gestion.dto.proformavente.ProformaVenteRequestDto;
import com.app.gestion.dto.proformavente.ProformaVenteResponseDto;
import com.app.gestion.dto.proformavente.ProformaVenteWorkflowDto;
import com.app.gestion.service.ProformaVenteService;
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

@RestController
@RequestMapping("/api/proforma-ventes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProformaVenteController {

    private final ProformaVenteService proformaVenteService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<Page<ProformaVenteResponseDto>> getAllProformaVentes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateEntree") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ProformaVenteResponseDto> proformaPage = proformaVenteService.getAllProformaVentes(pageable);

        return ResponseEntity.ok(proformaPage);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<ProformaVenteResponseDto> getProformaVenteById(@PathVariable Integer id) {
        ProformaVenteResponseDto proforma = proformaVenteService.getProformaVenteById(id);
        return ResponseEntity.ok(proforma);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<ProformaVenteResponseDto> createProformaVente(
            @Valid @RequestBody ProformaVenteRequestDto requestDto) {
        ProformaVenteResponseDto created = proformaVenteService.createProformaVente(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE')")
    public ResponseEntity<ProformaVenteResponseDto> updateProformaVente(
            @PathVariable Integer id,
            @Valid @RequestBody ProformaVenteRequestDto requestDto) {
        ProformaVenteResponseDto updated = proformaVenteService.updateProformaVente(id, requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProformaVente(@PathVariable Integer id) {
        proformaVenteService.deleteProformaVente(id);
        return ResponseEntity.noContent().build();
    }

    // ============ ENDPOINTS DE WORKFLOW ============

    /**
     * Changer le statut d'un pro-forma (ENVOYER, ACCEPTER, REFUSER, TRANSFORMER)
     */
    @PostMapping("/{id}/workflow")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<ProformaVenteResponseDto> changerStatut(
            @PathVariable Integer id,
            @RequestBody ProformaVenteWorkflowDto workflowDto) {
        workflowDto.setProformaId(id);
        ProformaVenteResponseDto updated = proformaVenteService.changerStatutProforma(id, workflowDto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Valider une remise exceptionnelle (réservé aux responsables et admins)
     */
    @PostMapping("/{id}/valider-remise")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE')")
    public ResponseEntity<ProformaVenteResponseDto> validerRemiseExceptionnelle(
            @PathVariable Integer id,
            @RequestBody(required = false) String motif) {
        ProformaVenteResponseDto validated = proformaVenteService.validerRemiseExceptionnelle(id, motif);
        return ResponseEntity.ok(validated);
    }
}
