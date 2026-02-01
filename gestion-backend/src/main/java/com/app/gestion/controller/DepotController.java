package com.app.gestion.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.gestion.dto.stock.DepotDTO;
import com.app.gestion.service.DepotService;

@RestController
@RequestMapping("/api/depots")
@CrossOrigin(origins = "*")
public class DepotController {

    private final DepotService depotService;

    public DepotController(DepotService depotService) {
        this.depotService = depotService;
    }

    /**
     * Récupère tous les dépôts
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_RESP_ACHAT', 'ROLE_RESP_MAGASIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<DepotDTO>> getAllDepots() {
        try {
            List<DepotDTO> depots = depotService.getAll();
            return ResponseEntity.ok(depots);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupère les dépôts de l'entité de l'utilisateur connecté
     */
    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('ROLE_RESP_ACHAT', 'ROLE_RESP_MAGASIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<DepotDTO>> getDepotsForCurrentUser() {
        try {
            List<DepotDTO> depots = depotService.getAllForCurrentUser();
            return ResponseEntity.ok(depots);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
