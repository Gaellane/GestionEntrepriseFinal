package com.app.gestion.controller;

import com.app.gestion.dto.reporting.*;
import com.app.gestion.service.ExportVenteService;
import com.app.gestion.service.KpiVenteService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Controller pour les KPI et Reporting des ventes (9.1 - 9.5)
 */
@RestController
@RequestMapping("/api/reporting/ventes")
@RequiredArgsConstructor
@Slf4j
public class KpiVenteController {

    private final KpiVenteService kpiVenteService;
    private final ExportVenteService exportVenteService;

    // =========== 9.1 KPI RESPONSABLE COMMERCIAL ===========

    /**
     * KPI pour responsable commercial
     * Niveau d'accès: ventes (30-39) ou supérieur
     */
    @GetMapping("/kpi/commercial")
    @PreAuthorize("hasAnyRole('VENTE', 'RESPONSABLE_VENTE', 'FINANCE', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<KpiCommercialDto> getKpiCommercial(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Integer commercialId) {

        log.info("GET /api/reporting/ventes/kpi/commercial - période: {} à {}", dateDebut, dateFin);

        ReportingFilterDto filter = ReportingFilterDto.builder()
                .dateDebut(dateDebut != null ? dateDebut : LocalDate.now().minusMonths(1))
                .dateFin(dateFin != null ? dateFin : LocalDate.now())
                .commercialId(commercialId)
                .build();

        KpiCommercialDto kpi = kpiVenteService.getKpiCommercial(filter);
        return ResponseEntity.ok(kpi);
    }

    // =========== 9.2 KPI FINANCE ===========

    /**
     * KPI pour service finance
     * Niveau d'accès: finance (50-59) ou supérieur
     */
    @GetMapping("/kpi/finance")
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<KpiFinanceDto> getKpiFinance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {

        log.info("GET /api/reporting/ventes/kpi/finance - période: {} à {}", dateDebut, dateFin);

        ReportingFilterDto filter = ReportingFilterDto.builder()
                .dateDebut(dateDebut != null ? dateDebut : LocalDate.now().minusMonths(1))
                .dateFin(dateFin != null ? dateFin : LocalDate.now())
                .build();

        KpiFinanceDto kpi = kpiVenteService.getKpiFinance(filter);
        return ResponseEntity.ok(kpi);
    }

    // =========== 9.3 KPI DIRECTION GÉNÉRALE ===========

    /**
     * KPI pour direction générale
     * Niveau d'accès: direction (100) ou admin
     */
    @GetMapping("/kpi/direction")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTION')")
    public ResponseEntity<KpiDirectionDto> getKpiDirection(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {

        log.info("GET /api/reporting/ventes/kpi/direction - période: {} à {}", dateDebut, dateFin);

        ReportingFilterDto filter = ReportingFilterDto.builder()
                .dateDebut(dateDebut != null ? dateDebut : LocalDate.now().minusMonths(1))
                .dateFin(dateFin != null ? dateFin : LocalDate.now())
                .build();

        KpiDirectionDto kpi = kpiVenteService.getKpiDirection(filter);
        return ResponseEntity.ok(kpi);
    }

    // =========== 9.4 DASHBOARDS ===========

    /**
     * Dashboard commercial
     */
    @GetMapping("/dashboard/commercial")
    @PreAuthorize("hasAnyRole('VENTE', 'RESPONSABLE_VENTE', 'FINANCE', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<DashboardDto> getDashboardCommercial(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {

        log.info("GET /api/reporting/ventes/dashboard/commercial");

        ReportingFilterDto filter = ReportingFilterDto.builder()
                .dateDebut(dateDebut != null ? dateDebut : LocalDate.now().minusMonths(1))
                .dateFin(dateFin != null ? dateFin : LocalDate.now())
                .build();

        DashboardDto dashboard = kpiVenteService.getDashboard("COMMERCIAL", filter);
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Dashboard responsable des ventes
     */
    @GetMapping("/dashboard/responsable")
    @PreAuthorize("hasAnyRole('RESPONSABLE_VENTE', 'FINANCE', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<DashboardDto> getDashboardResponsable(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {

        log.info("GET /api/reporting/ventes/dashboard/responsable");

        ReportingFilterDto filter = ReportingFilterDto.builder()
                .dateDebut(dateDebut != null ? dateDebut : LocalDate.now().minusMonths(1))
                .dateFin(dateFin != null ? dateFin : LocalDate.now())
                .build();

        DashboardDto dashboard = kpiVenteService.getDashboard("RESPONSABLE", filter);
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Dashboard direction
     */
    @GetMapping("/dashboard/direction")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTION')")
    public ResponseEntity<DashboardDto> getDashboardDirection(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {

        log.info("GET /api/reporting/ventes/dashboard/direction");

        ReportingFilterDto filter = ReportingFilterDto.builder()
                .dateDebut(dateDebut != null ? dateDebut : LocalDate.now().minusMonths(1))
                .dateFin(dateFin != null ? dateFin : LocalDate.now())
                .build();

        DashboardDto dashboard = kpiVenteService.getDashboard("DIRECTION", filter);
        return ResponseEntity.ok(dashboard);
    }

    // =========== 9.5 EXPORTS ===========

    /**
     * Liste des ventes pour export (preview)
     */
    @GetMapping("/export/preview")
    @PreAuthorize("hasAnyRole('VENTE', 'RESPONSABLE_VENTE', 'FINANCE', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<List<VenteExportDto>> getVentesExportPreview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Integer commercialId,
            @RequestParam(required = false) Integer clientId) {

        log.info("GET /api/reporting/ventes/export/preview");

        ReportingFilterDto filter = ReportingFilterDto.builder()
                .dateDebut(dateDebut != null ? dateDebut : LocalDate.now().minusMonths(1))
                .dateFin(dateFin != null ? dateFin : LocalDate.now())
                .commercialId(commercialId)
                .clientId(clientId)
                .build();

        List<VenteExportDto> ventes = exportVenteService.getVentesForExport(filter);
        return ResponseEntity.ok(ventes);
    }

    /**
     * Export ventes en Excel
     */
    @GetMapping("/export/excel")
    @PreAuthorize("hasAnyRole('VENTE', 'RESPONSABLE_VENTE', 'FINANCE', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<byte[]> exportVentesExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Integer commercialId,
            @RequestParam(required = false) Integer clientId) {

        log.info("GET /api/reporting/ventes/export/excel");

        ReportingFilterDto filter = buildFilter(dateDebut, dateFin, commercialId, clientId);
        byte[] content = exportVenteService.exportToExcel(filter);

        String filename = "ventes_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(content);
    }

    /**
     * Export ventes en CSV
     */
    @GetMapping("/export/csv")
    @PreAuthorize("hasAnyRole('VENTE', 'RESPONSABLE_VENTE', 'FINANCE', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<byte[]> exportVentesCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Integer commercialId,
            @RequestParam(required = false) Integer clientId) {

        log.info("GET /api/reporting/ventes/export/csv");

        ReportingFilterDto filter = buildFilter(dateDebut, dateFin, commercialId, clientId);
        byte[] content = exportVenteService.exportToCsv(filter);

        String filename = "ventes_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(content);
    }

    /**
     * Export ventes en PDF
     */
    @GetMapping("/export/pdf")
    @PreAuthorize("hasAnyRole('VENTE', 'RESPONSABLE_VENTE', 'FINANCE', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<byte[]> exportVentesPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Integer commercialId,
            @RequestParam(required = false) Integer clientId) {

        log.info("GET /api/reporting/ventes/export/pdf");

        ReportingFilterDto filter = buildFilter(dateDebut, dateFin, commercialId, clientId);
        byte[] content = exportVenteService.exportToPdf(filter);

        String filename = "ventes_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(content);
    }

    // =========== EXPORTS KPI ===========

    /**
     * Export KPI Commercial en Excel
     */
    @GetMapping("/kpi/commercial/export/excel")
    @PreAuthorize("hasAnyRole('RESPONSABLE_VENTE', 'FINANCE', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<byte[]> exportKpiCommercialExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {

        log.info("GET /api/reporting/ventes/kpi/commercial/export/excel");

        ReportingFilterDto filter = buildFilter(dateDebut, dateFin, null, null);
        byte[] content = exportVenteService.exportKpiCommercialToExcel(filter);

        String filename = "kpi_commercial_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(content);
    }

    /**
     * Export KPI Finance en Excel
     */
    @GetMapping("/kpi/finance/export/excel")
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<byte[]> exportKpiFinanceExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {

        log.info("GET /api/reporting/ventes/kpi/finance/export/excel");

        ReportingFilterDto filter = buildFilter(dateDebut, dateFin, null, null);
        byte[] content = exportVenteService.exportKpiFinanceToExcel(filter);

        String filename = "kpi_finance_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(content);
    }

    /**
     * Export KPI Direction en Excel
     */
    @GetMapping("/kpi/direction/export/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTION')")
    public ResponseEntity<byte[]> exportKpiDirectionExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {

        log.info("GET /api/reporting/ventes/kpi/direction/export/excel");

        ReportingFilterDto filter = buildFilter(dateDebut, dateFin, null, null);
        byte[] content = exportVenteService.exportKpiDirectionToExcel(filter);

        String filename = "kpi_direction_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(content);
    }

    // =========== MÉTHODE UTILITAIRE ===========

    private ReportingFilterDto buildFilter(LocalDate dateDebut, LocalDate dateFin,
            Integer commercialId, Integer clientId) {
        return ReportingFilterDto.builder()
                .dateDebut(dateDebut != null ? dateDebut : LocalDate.now().minusMonths(1))
                .dateFin(dateFin != null ? dateFin : LocalDate.now())
                .commercialId(commercialId)
                .clientId(clientId)
                .build();
    }
}
