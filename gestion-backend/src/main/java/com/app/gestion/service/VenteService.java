package com.app.gestion.service;

import com.app.gestion.dto.vente.VenteLigneDto;
import com.app.gestion.dto.vente.VenteRequestDto;
import com.app.gestion.dto.vente.VenteResponseDto;
import com.app.gestion.model.*;
import com.app.gestion.repository.*;
import com.app.gestion.utilitaire.ReferenceGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VenteService {

    private final VenteRepository venteRepository;
    private final VenteLigneRepository venteLigneRepository;
    private final ProformaVenteRepository proformaVenteRepository;
    private final ProformaVenteLigneRepository proformaVenteLigneRepository;
    private final ClientRepository clientRepository;
    private final ArticleRepository articleRepository;
    private final VenteProcessRepository venteProcessRepository;
    private final ConfigurationRepository configurationRepository;
    private final AuditLogRepository auditLogRepository;
    private final ActionRepository actionRepository;
    private final StockReservationService stockReservationService;
    private final VenteHistoriqueRepository venteHistoriqueRepository;

    @Transactional(readOnly = true)
    public Page<VenteResponseDto> getAllVentes(Pageable pageable) {
        Page<Vente> ventePage = venteRepository.findAll(pageable);
        return ventePage.map(this::mapToResponseDto);
    }

    @Transactional(readOnly = true)
    public VenteResponseDto getVenteById(Integer id) {
        Vente vente = venteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée avec l'id: " + id));
        return mapToResponseDto(vente);
    }

    /**
     * 3.1 Création commande depuis pro-forma
     */
    @Transactional
    public VenteResponseDto createFromProforma(Integer proformaId, VenteRequestDto requestDto) {
        // Récupérer le pro-forma
        ProformaVente proforma = proformaVenteRepository.findById(proformaId)
                .orElseThrow(() -> new RuntimeException("Pro-forma non trouvé"));

        // Vérifier que le pro-forma est accepté
        if (proforma.getProcess().getValeur() != 30) {
            throw new RuntimeException("Seul un pro-forma accepté peut être transformé en commande");
        }

        // Récupérer le processus initial de vente (le premier)
        VenteProcess process = venteProcessRepository.findAll().stream()
                .min((p1, p2) -> Integer.compare(p1.getValeur(), p2.getValeur()))
                .orElseThrow(() -> new RuntimeException("Aucun processus de vente trouvé"));

        // Générer la référence unique
        String reference = ReferenceGenerator.generateReference("CMD-");

        // Récupérer le taux de TVA
        Double tauxTVA = getTauxTVA();

        // Créer la vente en copiant les données du pro-forma
        Vente vente = Vente.builder()
                // .client(proforma.getClient())
                .proforma(proforma)
                .process(process)
                .refe(reference)
                .dateEntree(LocalDateTime.now())
                .dateEffective(requestDto.getDateEffective())
                .dateLivraison(requestDto.getDateLivraison())
                .locationLivraison(requestDto.getLocationLivraison())
                .remisePourcentage(proforma.getRemisePourcentage())
                .remiseFixe(proforma.getRemiseFixe())
                .build();

        // Sauvegarder la vente
        Vente savedVente = venteRepository.save(vente);

        // Copier les lignes du pro-forma
        List<VenteLigne> lignes = new ArrayList<>();
        for (ProformaVenteLigne proformaLigne : proforma.getProformaVenteLignes()) {
            VenteLigne ligne = VenteLigne.builder()
                    .vente(savedVente)
                    .article(proformaLigne.getArticle())
                    .quantite(proformaLigne.getQuantite())
                    .prixUnitaire(proformaLigne.getPrixUnitaire())
                    .remisePourcentage(proformaLigne.getRemisePourcentage())
                    .remiseFixe(proformaLigne.getRemiseFixe())
                    .build();
            lignes.add(ligne);
        }

        venteLigneRepository.saveAll(lignes);

        // Calculer et mettre à jour le prix total
        Double prixTotal = calculatePrixTotal(lignes, savedVente.getRemisePourcentage(),
                savedVente.getRemiseFixe(), tauxTVA);
        savedVente.setPrixTotal(prixTotal);
        savedVente = venteRepository.save(savedVente);

        // 3.3 & 3.4 - Vérification et réservation automatique de stock
        Integer depotPrincipal = 1; // TODO: À paramétrer
        verifierEtReserverStock(savedVente.getId(), depotPrincipal);

        // Journalisation
        String details = String.format("Création commande depuis pro-forma %s", proforma.getRefe());
        logAction("CREATE", null, savedVente, details);

        return mapToResponseDto(savedVente);
    }

    /**
     * 3.1 Création commande directe (sans pro-forma)
     */
    @Transactional
    public VenteResponseDto createDirectVente(VenteRequestDto requestDto) {
        // Validation du client
        Client client = clientRepository.findById(requestDto.getClientId())
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        // Récupérer le processus initial de vente
        VenteProcess process = venteProcessRepository.findAll().stream()
                .min((p1, p2) -> Integer.compare(p1.getValeur(), p2.getValeur()))
                .orElseThrow(() -> new RuntimeException("Aucun processus de vente trouvé"));

        // Générer la référence unique
        String reference = ReferenceGenerator.generateReference("CMD-");

        // Récupérer le taux de TVA
        Double tauxTVA = getTauxTVA();

        // Créer la vente
        Vente vente = Vente.builder()
                // .client(client)
                .proforma(null) // Création directe
                .process(process)
                .refe(reference)
                .dateEntree(LocalDateTime.now())
                .dateEffective(requestDto.getDateEffective())
                .dateLivraison(requestDto.getDateLivraison())
                .locationLivraison(requestDto.getLocationLivraison())
                .remisePourcentage(requestDto.getRemisePourcentage() != null ? requestDto.getRemisePourcentage() : 0.0)
                .remiseFixe(requestDto.getRemiseFixe() != null ? requestDto.getRemiseFixe() : 0.0)
                .build();

        // Sauvegarder la vente
        Vente savedVente = venteRepository.save(vente);

        // Créer les lignes
        List<VenteLigne> lignes = new ArrayList<>();
        for (VenteLigneDto ligneDto : requestDto.getLignes()) {
            Article article = articleRepository.findById(ligneDto.getArticleId())
                    .orElseThrow(
                            () -> new RuntimeException("Article non trouvé avec l'id: " + ligneDto.getArticleId()));

            VenteLigne ligne = VenteLigne.builder()
                    .vente(savedVente)
                    .article(article)
                    .quantite(ligneDto.getQuantite())
                    .prixUnitaire(ligneDto.getPrixUnitaire())
                    .remisePourcentage(ligneDto.getRemisePourcentage() != null ? ligneDto.getRemisePourcentage() : 0.0)
                    .remiseFixe(ligneDto.getRemiseFixe() != null ? ligneDto.getRemiseFixe() : 0.0)
                    .build();

            lignes.add(ligne);
        }

        venteLigneRepository.saveAll(lignes);

        // Calculer et mettre à jour le prix total
        Double prixTotal = calculatePrixTotal(lignes, savedVente.getRemisePourcentage(),
                savedVente.getRemiseFixe(), tauxTVA);
        savedVente.setPrixTotal(prixTotal);
        savedVente = venteRepository.save(savedVente);

        // 3.3 & 3.4 - Vérification et réservation automatique de stock
        Integer depotPrincipal = 1; // TODO: À paramétrer
        verifierEtReserverStock(savedVente.getId(), depotPrincipal);

        // Journalisation
        logAction("CREATE", null, savedVente, "Création commande directe");

        return mapToResponseDto(savedVente);
    }

    @Transactional
    public VenteResponseDto updateVente(Integer id, VenteRequestDto requestDto) {
        Vente existingVente = venteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée avec l'id: " + id));

        // Sauvegarder l'ancien état pour l'audit
        Vente oldVente = copyVente(existingVente);

        // Mise à jour du client si changé
        // if (!existingVente.getClient().getId().equals(requestDto.getClientId())) {
        // Client newClient = clientRepository.findById(requestDto.getClientId())
        // .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        // existingVente.setClient(newClient);
        // }

        // Mise à jour des informations
        existingVente.setDateEffective(requestDto.getDateEffective());
        existingVente.setDateLivraison(requestDto.getDateLivraison());
        existingVente.setLocationLivraison(requestDto.getLocationLivraison());
        existingVente.setRemisePourcentage(
                requestDto.getRemisePourcentage() != null ? requestDto.getRemisePourcentage() : 0.0);
        existingVente.setRemiseFixe(requestDto.getRemiseFixe() != null ? requestDto.getRemiseFixe() : 0.0);

        // Supprimer les anciennes lignes
        venteLigneRepository.deleteAll(existingVente.getVenteLignes());

        // Créer les nouvelles lignes
        List<VenteLigne> nouveLlesLignes = new ArrayList<>();
        for (VenteLigneDto ligneDto : requestDto.getLignes()) {
            Article article = articleRepository.findById(ligneDto.getArticleId())
                    .orElseThrow(
                            () -> new RuntimeException("Article non trouvé avec l'id: " + ligneDto.getArticleId()));

            VenteLigne ligne = VenteLigne.builder()
                    .vente(existingVente)
                    .article(article)
                    .quantite(ligneDto.getQuantite())
                    .prixUnitaire(ligneDto.getPrixUnitaire())
                    .remisePourcentage(ligneDto.getRemisePourcentage() != null ? ligneDto.getRemisePourcentage() : 0.0)
                    .remiseFixe(ligneDto.getRemiseFixe() != null ? ligneDto.getRemiseFixe() : 0.0)
                    .build();

            nouveLlesLignes.add(ligne);
        }

        venteLigneRepository.saveAll(nouveLlesLignes);

        // Recalculer le prix total
        Double tauxTVA = getTauxTVA();
        Double prixTotal = calculatePrixTotal(nouveLlesLignes, existingVente.getRemisePourcentage(),
                existingVente.getRemiseFixe(), tauxTVA);
        existingVente.setPrixTotal(prixTotal);

        Vente updatedVente = venteRepository.save(existingVente);

        // Journalisation
        logAction("UPDATE", oldVente, updatedVente, "Modification de la commande");

        return mapToResponseDto(updatedVente);
    }

    @Transactional
    public void deleteVente(Integer id) {
        Vente vente = venteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée avec l'id: " + id));

        // Journalisation avant suppression
        logAction("DELETE", vente, null, "Suppression de la commande");

        venteRepository.delete(vente);
    }

    // ============ MÉTHODES UTILITAIRES PRIVÉES ============

    private Double getTauxTVA() {
        try {
            Configuration tvaConfig = configurationRepository.findByConfigKey("TVA")
                    .orElseThrow(() -> new RuntimeException("Configuration TVA non trouvée"));
            return Double.parseDouble(tvaConfig.getConfigValue());
        } catch (NumberFormatException e) {
            log.error("Erreur de parsing du taux de TVA, utilisation de 20% par défaut");
            return 20.0;
        }
    }

    private Double calculatePrixTotal(List<VenteLigne> lignes, Double remisePourcentageGlobale,
            Double remiseFixeGlobale, Double tauxTVA) {
        // Calculer le montant net total (avec remises par ligne)
        double montantNet = 0.0;
        for (VenteLigne ligne : lignes) {
            double montantBrut = ligne.getQuantite() * ligne.getPrixUnitaire();

            // Appliquer remise pourcentage ligne
            double montantApresRemisePct = montantBrut;
            if (ligne.getRemisePourcentage() != null && ligne.getRemisePourcentage() > 0) {
                montantApresRemisePct = montantBrut * (1 - ligne.getRemisePourcentage() / 100);
            }

            // Appliquer remise fixe ligne
            double montantNetLigne = montantApresRemisePct;
            if (ligne.getRemiseFixe() != null && ligne.getRemiseFixe() > 0) {
                montantNetLigne = Math.max(0, montantApresRemisePct - ligne.getRemiseFixe());
            }

            montantNet += montantNetLigne;
        }

        // Appliquer remise pourcentage globale
        double montantApresRemiseGlobalePct = montantNet;
        if (remisePourcentageGlobale != null && remisePourcentageGlobale > 0) {
            montantApresRemiseGlobalePct = montantNet * (1 - remisePourcentageGlobale / 100);
        }

        // Appliquer remise fixe globale
        double montantAvantTVA = montantApresRemiseGlobalePct;
        if (remiseFixeGlobale != null && remiseFixeGlobale > 0) {
            montantAvantTVA = Math.max(0, montantApresRemiseGlobalePct - remiseFixeGlobale);
        }

        // Appliquer TVA
        double montantTVA = montantAvantTVA * (tauxTVA / 100);
        double prixTotal = montantAvantTVA + montantTVA;

        return Math.round(prixTotal * 100.0) / 100.0;
    }

    private VenteResponseDto mapToResponseDto(Vente vente) {
        Double tauxTVA = getTauxTVA();

        // Mapper les lignes
        List<VenteLigneDto> lignesDto = vente.getVenteLignes().stream()
                .map(ligne -> {
                    double montantBrut = ligne.getQuantite() * ligne.getPrixUnitaire();

                    double montantApresRemisePct = montantBrut;
                    if (ligne.getRemisePourcentage() != null && ligne.getRemisePourcentage() > 0) {
                        montantApresRemisePct = montantBrut * (1 - ligne.getRemisePourcentage() / 100);
                    }

                    double montantNetLigne = montantApresRemisePct;
                    if (ligne.getRemiseFixe() != null && ligne.getRemiseFixe() > 0) {
                        montantNetLigne = Math.max(0, montantApresRemisePct - ligne.getRemiseFixe());
                    }

                    double montantRemise = montantBrut - montantNetLigne;

                    return VenteLigneDto.builder()
                            .id(ligne.getId())
                            .articleId(ligne.getArticle().getId())
                            .articleNom(ligne.getArticle().getArticleNom())
                            .articleReference(ligne.getArticle().getRefe())
                            .quantite(ligne.getQuantite())
                            .prixUnitaire(ligne.getPrixUnitaire())
                            .remisePourcentage(ligne.getRemisePourcentage())
                            .remiseFixe(ligne.getRemiseFixe())
                            .montantBrut(Math.round(montantBrut * 100.0) / 100.0)
                            .montantRemise(Math.round(montantRemise * 100.0) / 100.0)
                            .montantNet(Math.round(montantNetLigne * 100.0) / 100.0)
                            .build();
                })
                .collect(Collectors.toList());

        // Calculer les totaux
        double montantBrutTotal = lignesDto.stream()
                .mapToDouble(VenteLigneDto::getMontantBrut)
                .sum();

        double montantRemiseLignes = lignesDto.stream()
                .mapToDouble(VenteLigneDto::getMontantRemise)
                .sum();

        double sousTotal = lignesDto.stream()
                .mapToDouble(VenteLigneDto::getMontantNet)
                .sum();

        // Calculer remise globale
        double montantApresRemiseGlobalePct = sousTotal;
        if (vente.getRemisePourcentage() != null && vente.getRemisePourcentage() > 0) {
            montantApresRemiseGlobalePct = sousTotal * (1 - vente.getRemisePourcentage() / 100);
        }

        double montantAvantTVA = montantApresRemiseGlobalePct;
        if (vente.getRemiseFixe() != null && vente.getRemiseFixe() > 0) {
            montantAvantTVA = Math.max(0, montantApresRemiseGlobalePct - vente.getRemiseFixe());
        }

        double montantRemiseGlobale = sousTotal - montantAvantTVA;
        double montantTVA = montantAvantTVA * (tauxTVA / 100);

        return VenteResponseDto.builder()
                .id(vente.getId())
                .refe(vente.getRefe())
                .dateEntree(vente.getDateEntree())
                .dateEffective(vente.getDateEffective())
                .dateLivraison(vente.getDateLivraison())
                .locationLivraison(vente.getLocationLivraison())
                // .clientId(vente.getClient().getId())
                // .clientNom(vente.getClient().getClientNom())
                .proformaId(vente.getProforma() != null ? vente.getProforma().getId() : null)
                .proformaRefe(vente.getProforma() != null ? vente.getProforma().getRefe() : null)
                .lignes(lignesDto)
                .montantBrutTotal(Math.round(montantBrutTotal * 100.0) / 100.0)
                .montantRemiseLignes(Math.round(montantRemiseLignes * 100.0) / 100.0)
                .sousTotal(Math.round(sousTotal * 100.0) / 100.0)
                .remisePourcentage(vente.getRemisePourcentage())
                .remiseFixe(vente.getRemiseFixe())
                .montantRemiseGlobale(Math.round(montantRemiseGlobale * 100.0) / 100.0)
                .montantAvantTVA(Math.round(montantAvantTVA * 100.0) / 100.0)
                .tauxTVA(tauxTVA)
                .montantTVA(Math.round(montantTVA * 100.0) / 100.0)
                .prixTotal(vente.getPrixTotal())
                .processId(vente.getProcess().getId())
                .processName(vente.getProcess().getProcessName())
                .build();
    }

    private Vente copyVente(Vente source) {
        return Vente.builder()
                .id(source.getId())
                .refe(source.getRefe())
                // .client(source.getClient())
                .proforma(source.getProforma())
                .process(source.getProcess())
                .dateEntree(source.getDateEntree())
                .dateEffective(source.getDateEffective())
                .dateLivraison(source.getDateLivraison())
                .locationLivraison(source.getLocationLivraison())
                .prixTotal(source.getPrixTotal())
                .remisePourcentage(source.getRemisePourcentage())
                .remiseFixe(source.getRemiseFixe())
                .build();
    }

    private void logAction(String actionName, Vente oldVente, Vente newVente, String details) {
        try {
            Action action = actionRepository.findByActionName(actionName)
                    .orElseThrow(() -> new RuntimeException("Action non trouvée: " + actionName));

            Utilisateur utilisateur = getCurrentUser();

            String oldValues = oldVente != null ? convertVenteToJson(oldVente) : null;
            String newValues = newVente != null ? convertVenteToJson(newVente) : null;
            String idsClasses = newVente != null ? String.valueOf(newVente.getId())
                    : (oldVente != null ? String.valueOf(oldVente.getId()) : "");

            AuditLog auditLog = AuditLog.builder()
                    .utilisateur(utilisateur)
                    .action(action)
                    .classes("Vente")
                    .idsClasses(idsClasses)
                    .actionTimestamp(LocalDateTime.now())
                    .oldValues(oldValues)
                    .newValues(newValues)
                    .details(details)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Action {} journalisée pour Vente {}", actionName, idsClasses);
        } catch (Exception e) {
            log.error("Erreur lors de la journalisation de l'action {}: {}", actionName, e.getMessage());
        }
    }

    private String convertVenteToJson(Vente vente) {
        try {
            ObjectMapper objectMapper=new ObjectMapper();
            Map<String, Object> venteMap = new HashMap<>();
            venteMap.put("id", vente.getId());
            venteMap.put("refe", vente.getRefe());
            // venteMap.put("clientId", vente.getClient().getId());
            venteMap.put("proformaId", vente.getProforma() != null ? vente.getProforma().getId() : null);
            venteMap.put("prixTotal", vente.getPrixTotal());
            venteMap.put("remisePourcentage", vente.getRemisePourcentage());
            venteMap.put("remiseFixe", vente.getRemiseFixe());
            return objectMapper.writeValueAsString(venteMap);
        } catch (JsonProcessingException e) {
            log.error("Erreur lors de la conversion de la vente en JSON", e);
            return "{}";
        }
    }

    private Utilisateur getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Utilisateur) {
            return (Utilisateur) authentication.getPrincipal();
        }
        return null;
    }

    /**
     * 3.3 & 3.4 - Vérifier le stock disponible et réserver automatiquement
     * Bloque la création de la vente si le stock est insuffisant
     */
    private void verifierEtReserverStock(Integer venteId, Integer depotId) {
        // 3.4 - Vérifier que le stock est disponible pour toutes les lignes
        Map<Integer, String> erreurs = stockReservationService.verifierStockPourVente(venteId, depotId);

        if (!erreurs.isEmpty()) {
            // Construire le message d'erreur détaillé
            StringBuilder messageErreur = new StringBuilder("Stock insuffisant pour les articles suivants :\n");
            erreurs.values().forEach(msg -> messageErreur.append("- ").append(msg).append("\n"));

            log.error("Vérification stock échouée pour vente {}: {}", venteId, messageErreur);
            throw new RuntimeException(messageErreur.toString());
        }

        // 3.3 - Si le stock est disponible, créer les réservations automatiquement
        try {
            stockReservationService.reserverStockPourVente(venteId, depotId);
            log.info("Stock réservé avec succès pour vente ID {}", venteId);
        } catch (Exception e) {
            log.error("Erreur lors de la réservation de stock pour vente {}: {}", venteId, e.getMessage());
            throw new RuntimeException("Erreur lors de la réservation de stock: " + e.getMessage(), e);
        }
    }

    /**
     * 3.5 - Valider commercialement une commande
     * État: Brouillon (10) → Confirmée (60)
     * Déclenche la réservation de stock
     * Historise le changement dans vente_historiques
     */
    @Transactional
    public VenteResponseDto validerCommande(Integer venteId) {
        Vente vente = venteRepository.findById(venteId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée: " + venteId));

        // Vérifier que la commande est en état Brouillon
        if (vente.getProcess().getValeur() != 10) {
            throw new RuntimeException("Seule une commande en état Brouillon peut être validée. État actuel: "
                    + vente.getProcess().getProcessName());
        }

        // Récupérer le processus "Confirmée" (valeur 60)
        VenteProcess processConfirmee = venteProcessRepository.findByValeur(60)
                .orElseThrow(() -> new RuntimeException("Processus 'Confirmée' non trouvé"));

        VenteProcess ancienProcess = vente.getProcess();
        vente.setProcess(processConfirmee);
        Vente savedVente = venteRepository.save(vente);

        // 3.5 - Historiser le changement dans vente_historiques
        historiserChangementStatut(savedVente, processConfirmee);

        // 3.5 - Réserver le stock (uniquement si process_id >= Confirmée)
        Integer depotPrincipal = 1; // TODO: À paramétrer
        verifierEtReserverStock(venteId, depotPrincipal);

        // Journaliser dans audit_logs
        String details = String.format("Validation commerciale: %s → %s",
                ancienProcess.getProcessName(), processConfirmee.getProcessName());
        logAction("UPDATE", vente, savedVente, details);

        log.info("Commande {} validée: {} → {}", vente.getRefe(),
                ancienProcess.getProcessName(), processConfirmee.getProcessName());

        return mapToResponseDto(savedVente);
    }

    /**
     * 3.6 - Modifier les lignes d'une commande
     * Autorisé uniquement si process_id < En préparation (70)
     * Recalcule les réservations de stock
     * Journalise les modifications dans audit_logs
     */
    @Transactional
    public VenteResponseDto modifierLignesCommande(Integer venteId, List<VenteLigneDto> nouvellesLignes) {
        Vente vente = venteRepository.findById(venteId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée: " + venteId));

        // 3.6 - Vérifier que process_id < En préparation (70)
        if (vente.getProcess().getValeur() >= 70) {
            throw new RuntimeException("Impossible de modifier une commande en état '"
                    + vente.getProcess().getProcessName()
                    + "'. Modifications autorisées uniquement avant 'En préparation'.");
        }

        // Récupérer les anciennes lignes pour journalisation
        List<VenteLigne> anciennesLignes = venteLigneRepository.findAll().stream()
                .filter(l -> l.getVente().getId().equals(venteId))
                .toList();

        String oldValues = convertLignesToJson(anciennesLignes);

        // Supprimer les anciennes lignes
        venteLigneRepository.deleteAll(anciennesLignes);

        // Créer les nouvelles lignes
        List<VenteLigne> lignes = new ArrayList<>();
        for (VenteLigneDto ligneDto : nouvellesLignes) {
            Article article = articleRepository.findById(ligneDto.getArticleId())
                    .orElseThrow(() -> new RuntimeException("Article non trouvé: " + ligneDto.getArticleId()));

            VenteLigne ligne = VenteLigne.builder()
                    .vente(vente)
                    .article(article)
                    .quantite(ligneDto.getQuantite())
                    .prixUnitaire(ligneDto.getPrixUnitaire())
                    .remisePourcentage(ligneDto.getRemisePourcentage() != null ? ligneDto.getRemisePourcentage() : 0.0)
                    .remiseFixe(ligneDto.getRemiseFixe() != null ? ligneDto.getRemiseFixe() : 0.0)
                    .build();
            lignes.add(ligne);
        }

        venteLigneRepository.saveAll(lignes);

        // Recalculer le prix total
        Double tauxTVA = getTauxTVA();
        Double prixTotal = calculatePrixTotal(lignes, vente.getRemisePourcentage(), vente.getRemiseFixe(), tauxTVA);
        vente.setPrixTotal(prixTotal);
        Vente savedVente = venteRepository.save(vente);

        // 3.6 - Recalculer les réservations de stock si la commande est Confirmée ou
        // plus
        if (vente.getProcess().getValeur() >= 60) {
            // Libérer les anciennes réservations
            stockReservationService.libererReservationsVente(venteId, "Modification des lignes de commande");

            // Créer de nouvelles réservations
            Integer depotPrincipal = 1; // TODO: À paramétrer
            verifierEtReserverStock(venteId, depotPrincipal);
        }

        // 3.6 - Journaliser dans audit_logs avec old_values et new_values
        String newValues = convertLignesToJson(lignes);
        logActionWithOldNew("UPDATE", oldValues, newValues,
                "Modification des lignes de commande " + vente.getRefe());

        log.info("Lignes de commande {} modifiées: {} anciennes lignes → {} nouvelles lignes",
                vente.getRefe(), anciennesLignes.size(), lignes.size());

        return mapToResponseDto(savedVente);
    }

    /**
     * 3.7 - Annuler une commande
     * Réservé au Responsable ventes (role_id niveau 30-39)
     * Champ details obligatoire (motif)
     * Libère les réservations de stock
     * Historise dans vente_historiques
     */
    @Transactional
    public VenteResponseDto annulerCommande(Integer venteId, String motif) {
        if (motif == null || motif.trim().isEmpty()) {
            throw new RuntimeException("Le motif d'annulation est obligatoire");
        }

        Vente vente = venteRepository.findById(venteId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée: " + venteId));

        // 3.7 - Vérifier les droits (Responsable ventes uniquement)
        Utilisateur utilisateur = getCurrentUser();
        if (utilisateur == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }

        Integer niveauAcces = utilisateur.getRole().getNiveauAcces();
        // Responsable ventes: niveau_acces >= 30 ET < 40 (direction commerciale)
        if (niveauAcces < 30 || niveauAcces >= 40) {
            throw new RuntimeException(
                    "Seul un Responsable ventes peut annuler une commande. Niveau d'accès requis: 30-39.");
        }

        // Vérifier que la commande n'est pas déjà annulée ou livrée
        if (vente.getProcess().getValeur() == 99) {
            throw new RuntimeException("La commande est déjà annulée");
        }
        if (vente.getProcess().getValeur() == 90) {
            throw new RuntimeException("Impossible d'annuler une commande déjà livrée");
        }

        // Récupérer le processus "Annulée" (valeur 99)
        VenteProcess processAnnulee = venteProcessRepository.findByValeur(99)
                .orElseThrow(() -> new RuntimeException("Processus 'Annulée' non trouvé"));

        VenteProcess ancienProcess = vente.getProcess();
        vente.setProcess(processAnnulee);
        Vente savedVente = venteRepository.save(vente);

        // 3.7 - Libérer les réservations de stock (passer en état Libérée = 99)
        if (ancienProcess.getValeur() >= 60) {
            stockReservationService.libererReservationsVente(venteId, motif);
        }

        // 3.7 - Historiser dans vente_historiques
        historiserChangementStatut(savedVente, processAnnulee);

        // 3.7 - Journaliser dans audit_logs avec motif obligatoire dans details
        String details = String.format("Annulation commande par %s %s. Motif: %s",
                utilisateur.getRole().getRoleName(), utilisateur.getNom(), motif);
        logAction("UPDATE", vente, savedVente, details);

        log.info("Commande {} annulée: {} → {}. Motif: {}",
                vente.getRefe(), ancienProcess.getProcessName(), processAnnulee.getProcessName(), motif);

        return mapToResponseDto(savedVente);
    }

    /**
     * 3.5 - Historiser un changement de statut dans vente_historiques
     */
    private void historiserChangementStatut(Vente vente, VenteProcess process) {
        VenteHistorique historique = VenteHistorique.builder()
                .vente(vente)
                .process(process)
                .dateEntree(LocalDateTime.now())
                .build();

        venteHistoriqueRepository.save(historique);
        log.debug("Historique créé pour vente {} - processus: {}", vente.getRefe(), process.getProcessName());
    }

    /**
     * 3.6 - Journaliser avec old_values et new_values dans audit_logs
     */
    private void logActionWithOldNew(String actionName, String oldValues, String newValues, String details) {
        try {
            Utilisateur utilisateur = getCurrentUser();
            Action action = actionRepository.findByActionName(actionName)
                    .orElseGet(() -> {
                        Action newAction = new Action();
                        newAction.setActionName(actionName);
                        return actionRepository.save(newAction);
                    });

            AuditLog auditLog = AuditLog.builder()
                    .utilisateur(utilisateur)
                    .action(action)
                    .classes("VenteLigne")
                    .idsClasses("")
                    .actionTimestamp(LocalDateTime.now())
                    .oldValues(oldValues)
                    .newValues(newValues)
                    .details(details)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Action {} journalisée: {}", actionName, details);
        } catch (Exception e) {
            log.error("Erreur lors de la journalisation: {}", e.getMessage());
        }
    }

    /**
     * Convertir une liste de lignes en JSON pour audit_logs
     */
    private String convertLignesToJson(List<VenteLigne> lignes) {
        try {
            ObjectMapper objectMapper=new ObjectMapper();
            List<Map<String, Object>> lignesData = lignes.stream().map(ligne -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", ligne.getId());
                data.put("articleId", ligne.getArticle().getId());
                data.put("articleNom", ligne.getArticle().getArticleNom());
                data.put("quantite", ligne.getQuantite());
                data.put("prixUnitaire", ligne.getPrixUnitaire());
                data.put("remisePourcentage", ligne.getRemisePourcentage());
                data.put("remiseFixe", ligne.getRemiseFixe());
                return data;
            }).collect(Collectors.toList());
            return objectMapper.writeValueAsString(lignesData);
        } catch (JsonProcessingException e) {
            log.error("Erreur lors de la conversion des lignes en JSON", e);
            return "[]";
        }
    }
}
