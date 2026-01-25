package com.app.gestion.service;

import com.app.gestion.dto.reporting.*;
import com.app.gestion.model.*;
import com.app.gestion.repository.*;

import com.opencsv.CSVWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour l'export des données (9.5)
 * Supporte Excel (.xlsx), CSV et PDF
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ExportVenteService {

    private final VenteRepository venteRepository;
    private final KpiVenteService kpiVenteService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // =========== EXPORT VENTES ===========

    /**
     * Récupérer les ventes filtrées pour export
     */
    public List<VenteExportDto> getVentesForExport(ReportingFilterDto filter) {
        LocalDateTime dateDebut = filter.getDateDebut() != null ? filter.getDateDebut().atStartOfDay()
                : LocalDateTime.now().minusMonths(1);
        LocalDateTime dateFin = filter.getDateFin() != null ? filter.getDateFin().atTime(LocalTime.MAX)
                : LocalDateTime.now();

        List<Vente> ventes = venteRepository.findWithFilters(
                dateDebut, dateFin,
                filter.getCommercialId(),
                filter.getClientId());

        return ventes.stream()
                .map(this::toExportDto)
                .collect(Collectors.toList());
    }

    /**
     * Export Excel (.xlsx)
     */
    public byte[] exportToExcel(ReportingFilterDto filter) {
        List<VenteExportDto> ventes = getVentesForExport(filter);

        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Ventes");

            // Style pour en-tête
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            // En-tête
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "ID", "Référence", "Client", "Date Entrée", "Date Effective",
                    "Date Livraison", "Lieu Livraison", "Prix Total",
                    "Remise %", "Remise Fixe", "Remise Totale", "Statut"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Données
            int rowNum = 1;
            for (VenteExportDto vente : ventes) {
                Row row = sheet.createRow(rowNum++);

                row.createCell(0).setCellValue(vente.getId());
                row.createCell(1).setCellValue(vente.getReference());
                row.createCell(2).setCellValue(vente.getClientNom() != null ? vente.getClientNom() : "");
                row.createCell(3).setCellValue(
                        vente.getDateEntree() != null ? vente.getDateEntree().format(DATETIME_FORMATTER) : "");
                row.createCell(4).setCellValue(
                        vente.getDateEffective() != null ? vente.getDateEffective().format(DATE_FORMATTER) : "");
                row.createCell(5).setCellValue(
                        vente.getDateLivraison() != null ? vente.getDateLivraison().format(DATE_FORMATTER) : "");
                row.createCell(6)
                        .setCellValue(vente.getLocationLivraison() != null ? vente.getLocationLivraison() : "");
                row.createCell(7).setCellValue(vente.getPrixTotal() != null ? vente.getPrixTotal() : 0);
                row.createCell(8).setCellValue(vente.getRemisePourcentage() != null ? vente.getRemisePourcentage() : 0);
                row.createCell(9).setCellValue(vente.getRemiseFixe() != null ? vente.getRemiseFixe() : 0);
                row.createCell(10).setCellValue(vente.getRemiseTotale() != null ? vente.getRemiseTotale() : 0);
                row.createCell(11).setCellValue(vente.getStatut() != null ? vente.getStatut() : "");
            }

            // Ajuster la largeur des colonnes
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de l'export Excel", e);
            throw new RuntimeException("Erreur lors de l'export Excel: " + e.getMessage());
        }
    }

    /**
     * Export CSV
     */
    public byte[] exportToCsv(ReportingFilterDto filter) {
        List<VenteExportDto> ventes = getVentesForExport(filter);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                OutputStreamWriter streamWriter = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8);
                CSVWriter csvWriter = new CSVWriter(streamWriter)) {

            // BOM UTF-8 pour Excel
            outputStream.write(new byte[] { (byte) 0xEF, (byte) 0xBB, (byte) 0xBF });

            // En-tête
            String[] headers = {
                    "ID", "Reference", "Client", "Date Entree", "Date Effective",
                    "Date Livraison", "Lieu Livraison", "Prix Total",
                    "Remise %", "Remise Fixe", "Remise Totale", "Statut"
            };
            csvWriter.writeNext(headers);

            // Données
            for (VenteExportDto vente : ventes) {
                String[] row = {
                        String.valueOf(vente.getId()),
                        vente.getReference(),
                        vente.getClientNom() != null ? vente.getClientNom() : "",
                        vente.getDateEntree() != null ? vente.getDateEntree().format(DATETIME_FORMATTER) : "",
                        vente.getDateEffective() != null ? vente.getDateEffective().format(DATE_FORMATTER) : "",
                        vente.getDateLivraison() != null ? vente.getDateLivraison().format(DATE_FORMATTER) : "",
                        vente.getLocationLivraison() != null ? vente.getLocationLivraison() : "",
                        String.valueOf(vente.getPrixTotal() != null ? vente.getPrixTotal() : 0),
                        String.valueOf(vente.getRemisePourcentage() != null ? vente.getRemisePourcentage() : 0),
                        String.valueOf(vente.getRemiseFixe() != null ? vente.getRemiseFixe() : 0),
                        String.valueOf(vente.getRemiseTotale() != null ? vente.getRemiseTotale() : 0),
                        vente.getStatut() != null ? vente.getStatut() : ""
                };
                csvWriter.writeNext(row);
            }

            csvWriter.flush();
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de l'export CSV", e);
            throw new RuntimeException("Erreur lors de l'export CSV: " + e.getMessage());
        }
    }

    /**
     * Export PDF (simplifié - format texte structuré)
     * Note: Une implémentation complète utiliserait iText pour le formatage PDF
     */
    public byte[] exportToPdf(ReportingFilterDto filter) {
        List<VenteExportDto> ventes = getVentesForExport(filter);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            // Pour une implémentation simplifiée, on crée un texte formaté
            // Une vraie implémentation utiliserait iText7
            StringBuilder sb = new StringBuilder();

            sb.append("=".repeat(80)).append("\n");
            sb.append("                    RAPPORT DES VENTES\n");
            sb.append("=".repeat(80)).append("\n\n");

            sb.append("Période: ");
            if (filter.getDateDebut() != null) {
                sb.append(filter.getDateDebut().format(DATE_FORMATTER));
            }
            sb.append(" - ");
            if (filter.getDateFin() != null) {
                sb.append(filter.getDateFin().format(DATE_FORMATTER));
            }
            sb.append("\n\n");

            sb.append(String.format("%-8s | %-15s | %-20s | %-12s | %-12s | %12s\n",
                    "ID", "Référence", "Client", "Date", "Statut", "Prix Total"));
            sb.append("-".repeat(80)).append("\n");

            double total = 0;
            for (VenteExportDto vente : ventes) {
                sb.append(String.format("%-8d | %-15s | %-20s | %-12s | %-12s | %12.2f\n",
                        vente.getId(),
                        truncate(vente.getReference(), 15),
                        truncate(vente.getClientNom() != null ? vente.getClientNom() : "", 20),
                        vente.getDateEntree() != null ? vente.getDateEntree().format(DATE_FORMATTER) : "",
                        truncate(vente.getStatut() != null ? vente.getStatut() : "", 12),
                        vente.getPrixTotal() != null ? vente.getPrixTotal() : 0));
                total += vente.getPrixTotal() != null ? vente.getPrixTotal() : 0;
            }

            sb.append("-".repeat(80)).append("\n");
            sb.append(String.format("%68s | %12.2f\n", "TOTAL", total));
            sb.append("=".repeat(80)).append("\n");
            sb.append("\nNombre de ventes: ").append(ventes.size()).append("\n");
            sb.append("Généré le: ").append(LocalDateTime.now().format(DATETIME_FORMATTER)).append("\n");

            return sb.toString().getBytes(StandardCharsets.UTF_8);

        } catch (Exception e) {
            log.error("Erreur lors de l'export PDF", e);
            throw new RuntimeException("Erreur lors de l'export PDF: " + e.getMessage());
        }
    }

    // =========== EXPORT KPIs ===========

    /**
     * Export KPIs Commercial en Excel
     */
    public byte[] exportKpiCommercialToExcel(ReportingFilterDto filter) {
        KpiCommercialDto kpi = kpiVenteService.getKpiCommercial(filter);

        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("KPI Commercial");

            // Style en-tête
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle valueStyle = workbook.createCellStyle();
            valueStyle.setAlignment(HorizontalAlignment.RIGHT);

            // Titre
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("KPI RESPONSABLE COMMERCIAL");

            // Période
            Row periodRow = sheet.createRow(1);
            periodRow.createCell(0).setCellValue("Période:");
            periodRow.createCell(1).setCellValue(
                    (filter.getDateDebut() != null ? filter.getDateDebut().format(DATE_FORMATTER) : "") +
                            " - " +
                            (filter.getDateFin() != null ? filter.getDateFin().format(DATE_FORMATTER) : ""));

            // KPIs
            int rowNum = 3;

            rowNum = addKpiRow(sheet, rowNum, "Commandes en cours", kpi.getCommandesEnCours(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Commandes livrées", kpi.getCommandesLivrees(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Commandes en retard", kpi.getCommandesEnRetard(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Taux d'annulation (%)", kpi.getTauxAnnulation(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Commandes annulées", kpi.getCommandesAnnulees(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Total remises (Ar)", kpi.getTotalRemises(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Dépassement plafond", kpi.getDepassementPlafond() ? "Oui" : "Non",
                    headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Exceptions validées", kpi.getExceptionsValidees(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Backlog non servi", kpi.getBacklogNonServi(), headerStyle);

            // Motifs d'annulation
            rowNum += 2;
            Row motifHeader = sheet.createRow(rowNum++);
            motifHeader.createCell(0).setCellValue("Motifs d'annulation:");

            if (kpi.getMotifsAnnulation() != null) {
                for (var entry : kpi.getMotifsAnnulation().entrySet()) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue("  - " + entry.getKey());
                    row.createCell(1).setCellValue(entry.getValue());
                }
            }

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de l'export KPI Commercial Excel", e);
            throw new RuntimeException("Erreur lors de l'export: " + e.getMessage());
        }
    }

    /**
     * Export KPIs Finance en Excel
     */
    public byte[] exportKpiFinanceToExcel(ReportingFilterDto filter) {
        KpiFinanceDto kpi = kpiVenteService.getKpiFinance(filter);

        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("KPI Finance");
            CellStyle headerStyle = createHeaderStyle(workbook);

            // Titre
            Row titleRow = sheet.createRow(0);
            titleRow.createCell(0).setCellValue("KPI FINANCE (VENTES)");

            // KPIs
            int rowNum = 2;

            rowNum = addKpiRow(sheet, rowNum, "CA Réalisé (Ar)", kpi.getCaRealise(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "CA Facturé (Ar)", kpi.getCaFacture(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "CA Encaissé (Ar)", kpi.getCaEncaisse(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Volume Remboursements (Ar)", kpi.getVolumeRemboursements(), headerStyle);
            rowNum++;
            rowNum = addKpiRow(sheet, rowNum, "Prix Vente Total (Ar)", kpi.getPrixVenteTotal(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Coût Réel Total (Ar)", kpi.getCoutReelTotal(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Marge Brute (Ar)", kpi.getMargeBrute(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Marge (%)", kpi.getMargePercent(), headerStyle);
            rowNum++;
            rowNum = addKpiRow(sheet, rowNum, "Variation Marge (Ar)", kpi.getVariationMarge(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Variation Marge (%)", kpi.getVariationMargePercent(), headerStyle);

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de l'export KPI Finance Excel", e);
            throw new RuntimeException("Erreur lors de l'export: " + e.getMessage());
        }
    }

    /**
     * Export KPIs Direction en Excel
     */
    public byte[] exportKpiDirectionToExcel(ReportingFilterDto filter) {
        KpiDirectionDto kpi = kpiVenteService.getKpiDirection(filter);

        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("KPI Direction");
            CellStyle headerStyle = createHeaderStyle(workbook);

            // Titre
            Row titleRow = sheet.createRow(0);
            titleRow.createCell(0).setCellValue("KPI DIRECTION GÉNÉRALE (VENTES)");

            // KPIs
            int rowNum = 2;

            rowNum = addKpiRow(sheet, rowNum, "CA Global (Ar)", kpi.getCaGlobal(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Marge Brute (Ar)", kpi.getMargeBrute(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Marge (%)", kpi.getMargePercent(), headerStyle);
            rowNum++;
            rowNum = addKpiRow(sheet, rowNum, "Évolution CA (Ar)", kpi.getEvolutionCa(), headerStyle);
            rowNum = addKpiRow(sheet, rowNum, "Évolution CA (%)", kpi.getEvolutionCaPercent(), headerStyle);

            // Top Clients
            rowNum += 2;
            Row clientHeader = sheet.createRow(rowNum++);
            clientHeader.createCell(0).setCellValue("TOP 10 CLIENTS");

            Row clientColHeader = sheet.createRow(rowNum++);
            clientColHeader.createCell(0).setCellValue("Client");
            clientColHeader.createCell(1).setCellValue("Total Achats (Ar)");
            clientColHeader.createCell(2).setCellValue("Nb Commandes");

            if (kpi.getTopClients() != null) {
                for (KpiDirectionDto.TopClientDto client : kpi.getTopClients()) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(client.getClientNom());
                    row.createCell(1).setCellValue(client.getTotalAchats());
                    row.createCell(2).setCellValue(client.getNombreCommandes());
                }
            }

            // Top Articles
            rowNum += 2;
            Row articleHeader = sheet.createRow(rowNum++);
            articleHeader.createCell(0).setCellValue("TOP 10 ARTICLES");

            Row articleColHeader = sheet.createRow(rowNum++);
            articleColHeader.createCell(0).setCellValue("Article");
            articleColHeader.createCell(1).setCellValue("Quantité");
            articleColHeader.createCell(2).setCellValue("CA (Ar)");

            if (kpi.getTopArticles() != null) {
                for (KpiDirectionDto.TopArticleDto article : kpi.getTopArticles()) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(article.getArticleNom());
                    row.createCell(1).setCellValue(article.getQuantiteTotale());
                    row.createCell(2).setCellValue(article.getCaTotalArticle());
                }
            }

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);
            sheet.autoSizeColumn(2);

            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de l'export KPI Direction Excel", e);
            throw new RuntimeException("Erreur lors de l'export: " + e.getMessage());
        }
    }

    // =========== MÉTHODES UTILITAIRES ===========

    private VenteExportDto toExportDto(Vente vente) {
        Double remiseTotale = 0.0;
        if (vente.getRemiseFixe() != null) {
            remiseTotale += vente.getRemiseFixe();
        }
        if (vente.getRemisePourcentage() != null && vente.getPrixTotal() != null) {
            remiseTotale += (vente.getPrixTotal() * vente.getRemisePourcentage() / 100);
        }

        String clientNom = null;
        if (vente.getProforma() != null && vente.getProforma().getClient() != null) {
            clientNom = vente.getProforma().getClient().getClientNom();
        }

        return VenteExportDto.builder()
                .id(vente.getId())
                .reference(vente.getRefe())
                .clientNom(clientNom)
                .dateEntree(vente.getDateEntree())
                .dateEffective(vente.getDateEffective())
                .dateLivraison(vente.getDateLivraison())
                .locationLivraison(vente.getLocationLivraison())
                .prixTotal(vente.getPrixTotal())
                .remisePourcentage(vente.getRemisePourcentage())
                .remiseFixe(vente.getRemiseFixe())
                .remiseTotale(remiseTotale)
                .statut(vente.getProcess() != null ? vente.getProcess().getProcessName() : null)
                .statutValeur(vente.getProcess() != null ? vente.getProcess().getValeur() : null)
                .build();
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private int addKpiRow(Sheet sheet, int rowNum, String label, Object value, CellStyle labelStyle) {
        Row row = sheet.createRow(rowNum);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);

        Cell valueCell = row.createCell(1);
        if (value instanceof Number) {
            valueCell.setCellValue(((Number) value).doubleValue());
        } else {
            valueCell.setCellValue(String.valueOf(value));
        }

        return rowNum + 1;
    }

    private String truncate(String str, int maxLength) {
        if (str == null)
            return "";
        return str.length() > maxLength ? str.substring(0, maxLength - 2) + ".." : str;
    }
}
