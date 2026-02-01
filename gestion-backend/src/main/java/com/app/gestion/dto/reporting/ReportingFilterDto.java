package com.app.gestion.dto.reporting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 9.5 - Filtres pour le reporting
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportingFilterDto {
    // Période
    private LocalDate dateDebut;
    private LocalDate dateFin;

    // Filtres optionnels
    private Integer commercialId;
    private Integer clientId;
    private Integer entityId;
    private Integer categorieId;

    // Pagination pour exports
    private Integer page;
    private Integer size;

    // Format export
    private String formatExport; // EXCEL, CSV, PDF
}
