package com.app.gestion.controller;

import com.app.gestion.dto.livraison.*;
import com.app.gestion.service.LivraisonVenteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/livraisons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LivraisonVenteController {

    private final LivraisonVenteService livraisonVenteService;

    /**
     * 4.2 - Lister les commandes à préparer (ventes Confirmées)
     */
    @GetMapping("/ventes-a-preparer")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_MAGASIN', 'EMP_MAGASIN')")
    public ResponseEntity<List<VenteAPreparerDto>> getVentesAPreparer() {
        List<VenteAPreparerDto> ventes = livraisonVenteService.getVentesAPreparer();
        return ResponseEntity.ok(ventes);
    }

    /**
     * 4.2 - Créer une livraison depuis une vente confirmée
     * Permet livraison partielle en spécifiant les quantités
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_MAGASIN', 'EMP_MAGASIN')")
    public ResponseEntity<LivraisonVenteResponseDto> creerLivraison(
            @Valid @RequestBody LivraisonVenteRequestDto requestDto) {
        LivraisonVenteResponseDto created = livraisonVenteService.creerLivraison(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Récupérer une livraison par ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_MAGASIN', 'EMP_MAGASIN')")
    public ResponseEntity<LivraisonVenteResponseDto> getLivraisonById(@PathVariable Integer id) {
        LivraisonVenteResponseDto livraison = livraisonVenteService.getLivraisonById(id);
        return ResponseEntity.ok(livraison);
    }

    /**
     * Lister toutes les livraisons
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_MAGASIN', 'EMP_MAGASIN')")
    public ResponseEntity<List<LivraisonVenteResponseDto>> getAllLivraisons() {
        List<LivraisonVenteResponseDto> livraisons = livraisonVenteService.getAllLivraisons();
        return ResponseEntity.ok(livraisons);
    }

    /**
     * 4.3 - Interface de préparation: afficher livraison avec lots disponibles
     */
    @GetMapping("/{id}/preparation")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_MAGASIN', 'EMP_MAGASIN')")
    public ResponseEntity<LivraisonVenteResponseDto> getLivraisonPourPreparation(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "1") Integer depotId) {
        LivraisonVenteResponseDto livraison = livraisonVenteService.getLivraisonAvecLotsDisponibles(id, depotId);
        return ResponseEntity.ok(livraison);
    }

    /**
     * 4.3 - Obtenir les lots disponibles pour une ligne de livraison
     * Méthode: FIFO (défaut) ou FEFO (produits périssables)
     */
    @GetMapping("/lignes/{livraisonLigneId}/lots-disponibles")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_MAGASIN', 'EMP_MAGASIN')")
    public ResponseEntity<List<LotDisponibleDto>> getLotsDisponibles(
            @PathVariable Integer livraisonLigneId,
            @RequestParam(defaultValue = "1") Integer depotId,
            @RequestParam(defaultValue = "FIFO") String methode) {

        List<LotDisponibleDto> lots = livraisonVenteService.getLotsDisponiblesPourLigne(
                livraisonLigneId, depotId, methode);
        return ResponseEntity.ok(lots);
    }
}
