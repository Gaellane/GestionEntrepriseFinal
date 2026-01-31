package com.app.gestion.controller;

import com.app.gestion.dto.stock.StockDisponibleDto;
import com.app.gestion.service.StockReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST pour la gestion des réservations de stock
 */
@RestController
@RequestMapping("/api/stock-reservations")
@RequiredArgsConstructor
public class StockReservationController {

    private final StockReservationService stockReservationService;

    /**
     * 3.4 - Consulter le stock disponible pour un article dans un dépôt
     */
    @GetMapping("/disponible")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<StockDisponibleDto> getStockDisponible(
            @RequestParam Integer articleId,
            @RequestParam Integer depotId) {

        Double stockTheorique = stockReservationService.calculerStockTheorique(articleId, depotId);
        Double stockReserve = stockReservationService.calculerStockReserve(articleId, depotId);
        Double stockDisponible = stockReservationService.calculerStockDisponible(articleId, depotId);

        StockDisponibleDto dto = StockDisponibleDto.builder()
                .articleId(articleId)
                .depotId(depotId)
                .stockTheorique(stockTheorique)
                .stockReserve(stockReserve)
                .stockDisponible(stockDisponible)
                .build();

        return ResponseEntity.ok(dto);
    }

    /**
     * 3.4 - Vérifier si le stock est suffisant pour une quantité donnée
     */
    @GetMapping("/verifier")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<Boolean> verifierStockDisponible(
            @RequestParam Integer articleId,
            @RequestParam Integer depotId,
            @RequestParam Double quantite) {

        boolean disponible = stockReservationService.verifierStockDisponible(articleId, depotId, quantite);
        return ResponseEntity.ok(disponible);
    }

    /**
     * Changer le statut d'une réservation
     * Transitions autorisées:
     * - Réservée (10) → Allouée (20) ou Libérée (99)
     * - Allouée (20) → Consommée (30) ou Libérée (99)
     */
    @PutMapping("/{id}/statut")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESP_VENTE')")
    public ResponseEntity<Void> changerStatut(
            @PathVariable Integer id,
            @RequestParam Integer nouvelleValeur,
            @RequestParam(required = false) String motif) {

        stockReservationService.changerStatutReservation(id, nouvelleValeur, motif);
        return ResponseEntity.ok().build();
    }

    /**
     * Libérer toutes les réservations d'une vente (en cas d'annulation)
     */
    @PostMapping("/vente/{venteId}/liberer")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESP_VENTE')")
    public ResponseEntity<Void> libererReservations(
            @PathVariable Integer venteId,
            @RequestParam(required = false) String motif) {

        stockReservationService.libererReservationsVente(venteId, motif);
        return ResponseEntity.ok().build();
    }
}
