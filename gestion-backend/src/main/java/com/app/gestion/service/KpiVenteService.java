package com.app.gestion.service;

import com.app.gestion.dto.reporting.*;
import com.app.gestion.model.*;
import com.app.gestion.repository.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service pour les KPI et Reporting des ventes (9.1 - 9.4)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class KpiVenteService {

    private final VenteRepository venteRepository;
    private final CaisseMouvementRepository caisseMouvementRepository;
    private final AuditLogRepository auditLogRepository;
    private final VenteLigneRepository venteLigneRepository;
    private final LotMouvementRepository lotMouvementRepository;
    private final ProformaVenteRepository proformaVenteRepository;

    // Plafond remise par défaut (configurable)
    private static final Double PLAFOND_REMISE_DEFAULT = 15.0; // 15%

    // =========== 9.1 KPI RESPONSABLE COMMERCIAL ===========

    public KpiCommercialDto getKpiCommercial(ReportingFilterDto filter) {
        LocalDateTime dateDebut = toStartOfDay(filter.getDateDebut());
        LocalDateTime dateFin = toEndOfDay(filter.getDateFin());

        // Commandes en cours
        Long commandesEnCours = venteRepository.countCommandesEnCours(dateDebut, dateFin);

        // Commandes livrées
        Long commandesLivrees = venteRepository.countCommandesLivrees(dateDebut, dateFin);

        // Commandes en retard
        Long commandesEnRetard = venteRepository.countCommandesEnRetard(LocalDate.now());

        // Taux d'annulation
        Long commandesAnnulees = venteRepository.countCommandesAnnulees(dateDebut, dateFin);
        Long commandesTotal = venteRepository.countCommandesTotalPeriode(dateDebut, dateFin);
        Double tauxAnnulation = commandesTotal > 0
                ? (commandesAnnulees.doubleValue() / commandesTotal.doubleValue()) * 100
                : 0.0;

        // Motifs d'annulation
        Map<String, Long> motifsAnnulation = analyserMotifsAnnulation(dateDebut, dateFin);

        // Remises
        Double totalRemisesFixe = venteRepository.sumRemisesFixe(dateDebut, dateFin);
        Double totalRemisesPourcentage = venteRepository.sumRemisesPourcentage(dateDebut, dateFin);
        Double totalRemises = totalRemisesFixe + totalRemisesPourcentage;

        // Vérifier dépassement plafond (simple moyenne %)
        Double caTotal = venteRepository.sumCaGlobal(dateDebut, dateFin);
        Double remiseMoyennePct = caTotal > 0 ? (totalRemises / caTotal) * 100 : 0.0;
        Boolean depassementPlafond = remiseMoyennePct > PLAFOND_REMISE_DEFAULT;

        // Exceptions validées
        Long exceptionsValidees = countExceptionsValidees(dateDebut, dateFin);

        // Backlog non servi (commandes confirmées mais sans livraison)
        Long backlogNonServi = countBacklogNonServi();

        return KpiCommercialDto.builder()
                .commandesEnCours(commandesEnCours)
                .commandesLivrees(commandesLivrees)
                .commandesEnRetard(commandesEnRetard)
                .tauxAnnulation(Math.round(tauxAnnulation * 100.0) / 100.0)
                .commandesAnnulees(commandesAnnulees)
                .commandesTotal(commandesTotal)
                .motifsAnnulation(motifsAnnulation)
                .totalRemisesFixe(totalRemisesFixe)
                .totalRemisesPourcentage(totalRemisesPourcentage)
                .totalRemises(totalRemises)
                .plafondRemise(PLAFOND_REMISE_DEFAULT)
                .depassementPlafond(depassementPlafond)
                .exceptionsValidees(exceptionsValidees)
                .backlogNonServi(backlogNonServi)
                .build();
    }

    // =========== 9.2 KPI FINANCE ===========

    public KpiFinanceDto getKpiFinance(ReportingFilterDto filter) {
        LocalDateTime dateDebut = toStartOfDay(filter.getDateDebut());
        LocalDateTime dateFin = toEndOfDay(filter.getDateFin());

        // CA réalisé (ventes livrées)
        Double caRealise = venteRepository.sumCaRealise(dateDebut, dateFin);

        // CA facturé = CA réalisé (pas de table factures)
        Double caFacture = caRealise;

        // CA encaissé
        Double caEncaisse = caisseMouvementRepository.sumEncaissements(dateDebut, dateFin);

        // Remboursements
        Double volumeRemboursements = caisseMouvementRepository.sumRemboursements(dateDebut, dateFin);

        // Causes remboursements
        Map<String, Double> causesRemboursements = analyserCausesRemboursements(dateDebut, dateFin);

        // Calcul marge
        MargeCalculResult margeActuelle = calculerMarge(dateDebut, dateFin);

        // Marge période précédente (même durée, période précédente)
        long dureeJours = java.time.temporal.ChronoUnit.DAYS.between(
                filter.getDateDebut(), filter.getDateFin());
        LocalDateTime dateDebutPrec = dateDebut.minusDays(dureeJours + 1);
        LocalDateTime dateFinPrec = dateDebut.minusDays(1);
        MargeCalculResult margePrecedente = calculerMarge(dateDebutPrec, dateFinPrec);

        // Variation marge
        Double variationMarge = margeActuelle.margeBrute - margePrecedente.margeBrute;
        Double variationMargePercent = margePrecedente.margeBrute != 0
                ? ((margeActuelle.margeBrute - margePrecedente.margeBrute) / margePrecedente.margeBrute) * 100
                : 0.0;

        return KpiFinanceDto.builder()
                .caRealise(caRealise)
                .caFacture(caFacture)
                .caEncaisse(caEncaisse)
                .volumeRemboursements(volumeRemboursements)
                .causesRemboursements(causesRemboursements)
                .prixVenteTotal(margeActuelle.prixVenteTotal)
                .coutReelTotal(margeActuelle.coutReelTotal)
                .margeBrute(margeActuelle.margeBrute)
                .margePercent(margeActuelle.margePercent)
                .margePeriodePrecedente(margePrecedente.margeBrute)
                .variationMarge(variationMarge)
                .variationMargePercent(Math.round(variationMargePercent * 100.0) / 100.0)
                .build();
    }

    // =========== 9.3 KPI DIRECTION GÉNÉRALE ===========

    public KpiDirectionDto getKpiDirection(ReportingFilterDto filter) {
        LocalDateTime dateDebut = toStartOfDay(filter.getDateDebut());
        LocalDateTime dateFin = toEndOfDay(filter.getDateFin());

        // CA global
        Double caGlobal = venteRepository.sumCaGlobal(dateDebut, dateFin);

        // Marge
        MargeCalculResult marge = calculerMarge(dateDebut, dateFin);

        // Période précédente
        long dureeJours = java.time.temporal.ChronoUnit.DAYS.between(
                filter.getDateDebut(), filter.getDateFin());
        LocalDateTime dateDebutPrec = dateDebut.minusDays(dureeJours + 1);
        LocalDateTime dateFinPrec = dateDebut.minusDays(1);
        Double caPeriodePrecedente = venteRepository.sumCaGlobal(dateDebutPrec, dateFinPrec);

        Double evolutionCa = caGlobal - caPeriodePrecedente;
        Double evolutionCaPercent = caPeriodePrecedente != 0
                ? ((caGlobal - caPeriodePrecedente) / caPeriodePrecedente) * 100
                : 0.0;

        // Top 10 clients
        List<Object[]> topClientsData = venteRepository.findTopClientsByCa(dateDebut, dateFin);
        List<KpiDirectionDto.TopClientDto> topClients = topClientsData.stream()
                .limit(10)
                .map(row -> KpiDirectionDto.TopClientDto.builder()
                        .clientId((Integer) row[0])
                        .clientNom((String) row[1])
                        .totalAchats(((Number) row[2]).doubleValue())
                        .nombreCommandes(((Number) row[3]).longValue())
                        .build())
                .collect(Collectors.toList());

        // Top 10 articles
        List<Object[]> topArticlesData = venteRepository.findTopArticlesByQuantite(dateDebut, dateFin);
        List<KpiDirectionDto.TopArticleDto> topArticles = topArticlesData.stream()
                .limit(10)
                .map(row -> KpiDirectionDto.TopArticleDto.builder()
                        .articleId((Integer) row[0])
                        .articleReference((String) row[1])
                        .articleNom((String) row[2])
                        .quantiteTotale(((Number) row[3]).doubleValue())
                        .caTotalArticle(((Number) row[4]).doubleValue())
                        .build())
                .collect(Collectors.toList());

        // Top commerciaux (via proforma utilisateur)
        List<KpiDirectionDto.TopCommercialDto> topCommerciaux = calculerTopCommerciaux(dateDebut, dateFin);

        return KpiDirectionDto.builder()
                .caGlobal(caGlobal)
                .margeBrute(marge.margeBrute)
                .margePercent(marge.margePercent)
                .caPeriodePrecedente(caPeriodePrecedente)
                .evolutionCa(evolutionCa)
                .evolutionCaPercent(Math.round(evolutionCaPercent * 100.0) / 100.0)
                .topClients(topClients)
                .topArticles(topArticles)
                .topCommerciaux(topCommerciaux)
                .build();
    }

    // =========== 9.4 DASHBOARD ===========

    public DashboardDto getDashboard(String typeDashboard, ReportingFilterDto filter) {
        LocalDateTime dateDebut = toStartOfDay(filter.getDateDebut());
        LocalDateTime dateFin = toEndOfDay(filter.getDateFin());
        LocalDateTime debutSemaine = LocalDateTime.now().minusDays(7).with(LocalTime.MIN);
        LocalDateTime debutMois = LocalDateTime.now().withDayOfMonth(1).with(LocalTime.MIN);
        LocalDateTime maintenant = LocalDateTime.now();

        // Commandes du jour
        Long commandesDuJour = venteRepository.countCommandesTotalPeriode(
                LocalDate.now().atStartOfDay(), maintenant);

        // CA semaine
        Double caSemaine = venteRepository.sumCaGlobal(debutSemaine, maintenant);

        // CA mois
        Double caMois = venteRepository.sumCaGlobal(debutMois, maintenant);

        // Pipeline par statut
        List<Object[]> pipelineData = venteRepository.countByStatut(dateDebut, dateFin);
        Map<String, Long> pipeline = new LinkedHashMap<>();
        for (Object[] row : pipelineData) {
            pipeline.put((String) row[0], ((Number) row[1]).longValue());
        }

        // Taux conversion proforma → commande
        Long proformasTotal = proformaVenteRepository.count();
        Long proformasConvertis = venteRepository.countCommandesTotalPeriode(
                LocalDateTime.of(2020, 1, 1, 0, 0), maintenant);
        Double tauxConversion = proformasTotal > 0
                ? (proformasConvertis.doubleValue() / proformasTotal.doubleValue()) * 100
                : 0.0;

        // Alertes
        List<DashboardDto.AlerteDto> alertes = genererAlertes();

        // CA mensuel (12 derniers mois)
        List<Object[]> caMensuelData = venteRepository.findCaMensuel(
                LocalDateTime.now().minusMonths(12));
        List<DashboardDto.CaMensuelDto> caMensuel = caMensuelData.stream()
                .map(row -> DashboardDto.CaMensuelDto.builder()
                        .mois((String) row[0])
                        .ca(((Number) row[1]).doubleValue())
                        .marge(0.0) // Simplifié
                        .build())
                .collect(Collectors.toList());

        // Marge par famille (simplifié)
        List<DashboardDto.MargeParFamilleDto> margeParFamille = new ArrayList<>();

        return DashboardDto.builder()
                .typeDashboard(typeDashboard)
                .commandesDuJour(commandesDuJour)
                .caSemaine(caSemaine)
                .caMois(caMois)
                .pipeline(pipeline)
                .tauxConversion(Math.round(tauxConversion * 100.0) / 100.0)
                .proformasTotal(proformasTotal)
                .proformasConvertis(proformasConvertis)
                .alertes(alertes)
                .caMensuel(caMensuel)
                .margeParFamille(margeParFamille)
                .build();
    }

    // =========== MÉTHODES PRIVÉES ===========

    private LocalDateTime toStartOfDay(LocalDate date) {
        return date != null ? date.atStartOfDay() : LocalDate.now().minusMonths(1).atStartOfDay();
    }

    private LocalDateTime toEndOfDay(LocalDate date) {
        return date != null ? date.atTime(LocalTime.MAX) : LocalDate.now().atTime(LocalTime.MAX);
    }

    /**
     * Analyser les motifs d'annulation depuis audit_logs.details
     */
    private Map<String, Long> analyserMotifsAnnulation(LocalDateTime dateDebut, LocalDateTime dateFin) {
        List<AuditLog> logsAnnulation = auditLogRepository.findLogsAnnulationVentes(dateDebut, dateFin);

        Map<String, Long> motifs = new HashMap<>();
        Pattern motifPattern = Pattern.compile("motif[:\\s]*(.*?)(?:$|,|;)", Pattern.CASE_INSENSITIVE);

        for (AuditLog log : logsAnnulation) {
            String details = log.getDetails();
            if (details != null && !details.isEmpty()) {
                Matcher matcher = motifPattern.matcher(details);
                if (matcher.find()) {
                    String motif = matcher.group(1).trim();
                    if (motif.isEmpty())
                        motif = "Non spécifié";
                    motifs.merge(motif, 1L, Long::sum);
                } else {
                    motifs.merge("Non spécifié", 1L, Long::sum);
                }
            } else {
                motifs.merge("Non spécifié", 1L, Long::sum);
            }
        }

        return motifs;
    }

    /**
     * Analyser les causes de remboursements depuis caisse_mouvements.details
     */
    private Map<String, Double> analyserCausesRemboursements(LocalDateTime dateDebut, LocalDateTime dateFin) {
        List<CaisseMouvement> remboursements = caisseMouvementRepository.findRemboursements(dateDebut, dateFin);

        Map<String, Double> causes = new HashMap<>();
        Pattern causePattern = Pattern.compile("cause[:\\s]*(.*?)(?:$|,|;)", Pattern.CASE_INSENSITIVE);

        for (CaisseMouvement mvt : remboursements) {
            String details = mvt.getDetails();
            String cause = "Non spécifiée";

            if (details != null && !details.isEmpty()) {
                Matcher matcher = causePattern.matcher(details);
                if (matcher.find()) {
                    cause = matcher.group(1).trim();
                    if (cause.isEmpty())
                        cause = "Non spécifiée";
                }
            }

            causes.merge(cause, Math.abs(mvt.getMontant()), Double::sum);
        }

        return causes;
    }

    /**
     * Calculer la marge brute
     * Marge = Prix de vente - Coût réel (via lot_mouvements)
     */
    private MargeCalculResult calculerMarge(LocalDateTime dateDebut, LocalDateTime dateFin) {
        // Prix de vente total des ventes livrées
        Double prixVenteTotal = venteRepository.sumCaRealise(dateDebut, dateFin);

        // Coût réel : simplifié - on prend 70% du prix de vente comme estimation
        // Une implémentation complète nécessiterait de tracer les lots utilisés pour
        // chaque vente
        Double coutReelTotal = prixVenteTotal * 0.70;

        Double margeBrute = prixVenteTotal - coutReelTotal;
        Double margePercent = prixVenteTotal > 0 ? (margeBrute / prixVenteTotal) * 100 : 0.0;

        return new MargeCalculResult(
                prixVenteTotal,
                coutReelTotal,
                margeBrute,
                Math.round(margePercent * 100.0) / 100.0);
    }

    private Long countExceptionsValidees(LocalDateTime dateDebut, LocalDateTime dateFin) {
        List<AuditLog> exceptions = auditLogRepository.findLogsExceptions(dateDebut, dateFin);
        return (long) exceptions.size();
    }

    private Long countBacklogNonServi() {
        // Commandes confirmées (60) qui n'ont pas de livraison
        return venteRepository.countCommandesEnCours(
                LocalDateTime.of(2020, 1, 1, 0, 0),
                LocalDateTime.now());
    }

    private List<KpiDirectionDto.TopCommercialDto> calculerTopCommerciaux(
            LocalDateTime dateDebut, LocalDateTime dateFin) {
        // Simplifié - requête agrégée par commercial serait idéale
        return new ArrayList<>();
    }

    private List<DashboardDto.AlerteDto> genererAlertes() {
        List<DashboardDto.AlerteDto> alertes = new ArrayList<>();

        // Ventes en retard
        List<Vente> ventesEnRetard = venteRepository.findVentesEnRetard(LocalDate.now());
        for (Vente v : ventesEnRetard) {
            alertes.add(DashboardDto.AlerteDto.builder()
                    .type("RETARD_LIVRAISON")
                    .message("Vente " + v.getRefe() + " en retard (livraison prévue: " + v.getDateLivraison() + ")")
                    .priorite("HIGH")
                    .referenceId(v.getId())
                    .referenceType("VENTE")
                    .build());
        }

        return alertes.stream().limit(20).collect(Collectors.toList());
    }

    // Classe interne pour résultat calcul marge
    private static class MargeCalculResult {
        Double prixVenteTotal;
        Double coutReelTotal;
        Double margeBrute;
        Double margePercent;

        MargeCalculResult(Double prixVenteTotal, Double coutReelTotal,
                Double margeBrute, Double margePercent) {
            this.prixVenteTotal = prixVenteTotal;
            this.coutReelTotal = coutReelTotal;
            this.margeBrute = margeBrute;
            this.margePercent = margePercent;
        }
    }
}
