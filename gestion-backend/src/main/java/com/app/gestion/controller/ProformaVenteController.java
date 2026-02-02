package com.app.gestion.controller;

import com.app.gestion.dto.proformavente.ProformaVenteRequestDto;
import com.app.gestion.dto.proformavente.ProformaVenteResponseDto;
import com.app.gestion.dto.proformavente.ProformaVenteWorkflowDto;
import com.app.gestion.dto.vente.VenteResponseDto;
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
     * Changer le statut d'un proforma (endpoint générique)
     */
    @PostMapping("/{id}/workflow")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<?> changerStatutProforma(
            @PathVariable Integer id,
            @RequestBody ProformaVenteWorkflowDto workflowDto) {
        
        String action = workflowDto.getAction();
        String motif = workflowDto.getMotif();
        
        switch (action.toUpperCase()) {
            case "ENVOYER":
                ProformaVenteResponseDto envoye = proformaVenteService.envoyerProforma(id);
                return ResponseEntity.ok(envoye);
                
            case "ACCEPTER":
                ProformaVenteResponseDto accepte = proformaVenteService.accepterProforma(id, motif);
                return ResponseEntity.ok(accepte);
                
            case "REFUSER":
                ProformaVenteResponseDto refuse = proformaVenteService.refuserProforma(id, motif);
                return ResponseEntity.ok(refuse);
                
            case "TRANSFORMER":
                VenteResponseDto vente = proformaVenteService.transformerEnVente(id);
                return ResponseEntity.ok(vente);
                
            default:
                throw new RuntimeException("Action de workflow inconnue: " + action);
        }
    }

    /**
     * Envoyer un proforma (Brouillon → Envoyé)
     */
    @PostMapping("/{id}/envoyer")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<ProformaVenteResponseDto> envoyerProforma(@PathVariable Integer id) {
        ProformaVenteResponseDto updated = proformaVenteService.envoyerProforma(id);
        return ResponseEntity.ok(updated);
    }

    /**
     * Accepter un proforma (Envoyé → Accepté)
     */
    @PostMapping("/{id}/accepter")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE')")
    public ResponseEntity<ProformaVenteResponseDto> accepterProforma(
            @PathVariable Integer id,
            @RequestBody(required = false) String motif) {
        ProformaVenteResponseDto updated = proformaVenteService.accepterProforma(id, motif);
        return ResponseEntity.ok(updated);
    }

    /**
     * Refuser un proforma (Envoyé → Refusé)
     */
    @PostMapping("/{id}/refuser")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE')")
    public ResponseEntity<ProformaVenteResponseDto> refuserProforma(
            @PathVariable Integer id,
            @RequestBody(required = false) String motif) {
        ProformaVenteResponseDto updated = proformaVenteService.refuserProforma(id, motif);
        return ResponseEntity.ok(updated);
    }

    /**
     * Transformer un proforma en vente (Accepté → Transformé + création vente)
     */
    @PostMapping("/{id}/transformer")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE')")
    public ResponseEntity<VenteResponseDto> transformerEnVente(@PathVariable Integer id) {
        VenteResponseDto vente = proformaVenteService.transformerEnVente(id);
        return ResponseEntity.ok(vente);
    }
}
