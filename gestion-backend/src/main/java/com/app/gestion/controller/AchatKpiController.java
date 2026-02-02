package com.app.gestion.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.gestion.dto.achat.AchatKpiDTO;
import com.app.gestion.service.AchatKpiService;

@RestController
@RequestMapping("/api/achats/kpi")
@CrossOrigin(origins = "*")
public class AchatKpiController {

    private final AchatKpiService achatKpiService;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public AchatKpiController(AchatKpiService achatKpiService) {
        this.achatKpiService = achatKpiService;
    }

    /**
     * Récupère le montant total des achats entre deux dates
     */
    @GetMapping("/montant-total-achats")
    @PreAuthorize("hasAnyRole('ROLE_RESP_ACHAT', 'ROLE_RESP_MAGASIN', 'ROLE_RESP_FINANCE', 'ROLE_ADMIN')")
    public ResponseEntity<Double> getMontantTotalAchats(
            @RequestParam String dateMin,
            @RequestParam String dateMax) {
        try {
            LocalDateTime dateMinParsed = LocalDateTime.parse(dateMin, DATE_FORMATTER);
            LocalDateTime dateMaxParsed = LocalDateTime.parse(dateMax, DATE_FORMATTER);
            Double montant = achatKpiService.getMontantTotalAchats(dateMinParsed, dateMaxParsed);
            return ResponseEntity.ok(montant);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupère le montant total des commandes entre deux dates
     */
    @GetMapping("/montant-total-commandes")
    @PreAuthorize("hasAnyRole('ROLE_RESP_ACHAT', 'ROLE_RESP_MAGASIN', 'ROLE_RESP_FINANCE', 'ROLE_ADMIN')")
    public ResponseEntity<Double> getMontantTotalCommandes(
            @RequestParam String dateMin,
            @RequestParam String dateMax) {
        try {
            LocalDateTime dateMinParsed = LocalDateTime.parse(dateMin, DATE_FORMATTER);
            LocalDateTime dateMaxParsed = LocalDateTime.parse(dateMax, DATE_FORMATTER);
            Double montant = achatKpiService.getMontantTotalCommandes(dateMinParsed, dateMaxParsed);
            return ResponseEntity.ok(montant);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compare le prix d'estimation et le prix réel entre deux dates
     */
    @GetMapping("/comparaison-prix")
    @PreAuthorize("hasAnyRole('ROLE_RESP_ACHAT', 'ROLE_RESP_MAGASIN', 'ROLE_RESP_FINANCE', 'ROLE_ADMIN')")
    public ResponseEntity<AchatKpiDTO> getComparaisonPrix(
            @RequestParam String dateMin,
            @RequestParam String dateMax) {
        try {
            LocalDateTime dateMinParsed = LocalDateTime.parse(dateMin, DATE_FORMATTER);
            LocalDateTime dateMaxParsed = LocalDateTime.parse(dateMax, DATE_FORMATTER);
            AchatKpiDTO kpi = achatKpiService.getComparaisonPrixEstimationVsReel(dateMinParsed, dateMaxParsed);
            return ResponseEntity.ok(kpi);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupère le coût moyen par achat entre deux dates
     */
    @GetMapping("/cout-moyen")
    @PreAuthorize("hasAnyRole('ROLE_RESP_ACHAT', 'ROLE_RESP_MAGASIN', 'ROLE_RESP_FINANCE', 'ROLE_ADMIN')")
    public ResponseEntity<Double> getCoutMoyen(
            @RequestParam String dateMin,
            @RequestParam String dateMax) {
        try {
            LocalDateTime dateMinParsed = LocalDateTime.parse(dateMin, DATE_FORMATTER);
            LocalDateTime dateMaxParsed = LocalDateTime.parse(dateMax, DATE_FORMATTER);
            Double coutMoyen = achatKpiService.getCoutMoyenParAchat(dateMinParsed, dateMaxParsed);
            return ResponseEntity.ok(coutMoyen);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Récupère tous les KPIs en une seule requête
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ROLE_RESP_ACHAT', 'ROLE_RESP_MAGASIN', 'ROLE_RESP_FINANCE', 'ROLE_ADMIN')")
    public ResponseEntity<AchatKpiDTO> getAllKpis(
            @RequestParam String dateMin,
            @RequestParam String dateMax) {
        try {
            LocalDateTime dateMinParsed = LocalDateTime.parse(dateMin, DATE_FORMATTER);
            LocalDateTime dateMaxParsed = LocalDateTime.parse(dateMax, DATE_FORMATTER);
            AchatKpiDTO kpis = achatKpiService.getAllKpis(dateMinParsed, dateMaxParsed);
            return ResponseEntity.ok(kpis);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
