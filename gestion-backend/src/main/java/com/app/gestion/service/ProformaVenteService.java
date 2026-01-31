package com.app.gestion.service;

import com.app.gestion.dto.proformavente.ProformaVenteLigneDto;
import com.app.gestion.dto.proformavente.ProformaVenteRequestDto;
import com.app.gestion.dto.proformavente.ProformaVenteResponseDto;
import com.app.gestion.dto.proformavente.ProformaVenteWorkflowDto;
import com.app.gestion.dto.vente.VenteRequestDto;
import com.app.gestion.dto.vente.VenteResponseDto;
import com.app.gestion.exception.RemiseException;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProformaVenteService {

    private final ProformaVenteRepository proformaVenteRepository;
    private final ProformaVenteLigneRepository proformaVenteLigneRepository;
    private final ClientRepository clientRepository;
    private final ArticleRepository articleRepository;
    private final VenteProcessRepository venteProcessRepository;
    private final ConfigurationRepository configurationRepository;
    private final AuditLogRepository auditLogRepository;
    private final ActionRepository actionRepository;
    private final ObjectMapper objectMapper;
    private final VenteService venteService; // Ajout pour transformation

    @Transactional(readOnly = true)
    public Page<ProformaVenteResponseDto> getAllProformaVentes(Pageable pageable) {
        Page<ProformaVente> proformaPage = proformaVenteRepository.findAll(pageable);
        return proformaPage.map(this::mapToResponseDto);
    }

    @Transactional(readOnly = true)
    public ProformaVenteResponseDto getProformaVenteById(Integer id) {
        ProformaVente proforma = proformaVenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pro-forma non trouvé avec l'id: " + id));
        return mapToResponseDto(proforma);
    }

    @Transactional
    public ProformaVenteResponseDto createProformaVente(ProformaVenteRequestDto requestDto) {
        // Validation du client
        Client client = clientRepository.findById(requestDto.getClientId())
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        // Validation des remises AVANT création
        Utilisateur currentUser = getCurrentUser();
        validateRemises(requestDto.getRemisePourcentage(), requestDto.getRemiseFixe(),
                requestDto.getLignes(), currentUser);

        // Récupérer le processus initial (Brouillon - valeur 10)
        VenteProcess process = venteProcessRepository.findAll().stream()
                .filter(p -> p.getValeur() == 10)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Processus 'Brouillon' non trouvé"));

        // Générer la référence unique
        String reference = ReferenceGenerator.generateReference("PFV-");

        // Récupérer le taux de TVA
        Double tauxTVA = getTauxTVA();

        // Créer le pro-forma
        ProformaVente proforma = ProformaVente.builder()
                .client(client)
                .process(process)
                .refe(reference)
                .dateEntree(LocalDateTime.now())
                .remisePourcentage(requestDto.getRemisePourcentage() != null ? requestDto.getRemisePourcentage() : 0.0)
                .remiseFixe(requestDto.getRemiseFixe() != null ? requestDto.getRemiseFixe() : 0.0)
                .build();

        // Sauvegarder d'abord le pro-forma pour obtenir l'ID
        ProformaVente savedProforma = proformaVenteRepository.save(proforma);

        // Créer les lignes
        List<ProformaVenteLigne> lignes = new ArrayList<>();
        for (ProformaVenteLigneDto ligneDto : requestDto.getLignes()) {
            Article article = articleRepository.findById(ligneDto.getArticleId())
                    .orElseThrow(
                            () -> new RuntimeException("Article non trouvé avec l'id: " + ligneDto.getArticleId()));

            ProformaVenteLigne ligne = ProformaVenteLigne.builder()
                    .proforma(savedProforma)
                    .article(article)
                    .quantite(ligneDto.getQuantite())
                    .prixUnitaire(ligneDto.getPrixUnitaire())
                    .remisePourcentage(ligneDto.getRemisePourcentage() != null ? ligneDto.getRemisePourcentage() : 0.0)
                    .remiseFixe(ligneDto.getRemiseFixe() != null ? ligneDto.getRemiseFixe() : 0.0)
                    .build();

            lignes.add(ligne);
        }

        proformaVenteLigneRepository.saveAll(lignes);

        // Calculer et mettre à jour le prix total
        Double prixTotal = calculatePrixTotal(lignes, savedProforma.getRemisePourcentage(),
                savedProforma.getRemiseFixe(), tauxTVA);
        savedProforma.setPrixTotal(prixTotal);
        savedProforma = proformaVenteRepository.save(savedProforma);

        // Journalisation avec détails si remise exceptionnelle
        String details = "Création du pro-forma vente";
        if (isRemiseExceptionnelle(requestDto.getRemisePourcentage(), currentUser)) {
            details += " - REMISE EXCEPTIONNELLE: " + requestDto.getRemisePourcentage() + "%";
        }
        logAction("CREATE", null, savedProforma, details);

        return mapToResponseDto(savedProforma);
    }

    @Transactional
    public ProformaVenteResponseDto updateProformaVente(Integer id, ProformaVenteRequestDto requestDto) {
        ProformaVente existingProforma = proformaVenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pro-forma non trouvé avec l'id: " + id));

        // Sauvegarder l'ancien état pour l'audit
        ProformaVente oldProforma = copyProforma(existingProforma);

        // Mise à jour du client si changé
        if (!existingProforma.getClient().getId().equals(requestDto.getClientId())) {
            Client newClient = clientRepository.findById(requestDto.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client non trouvé"));
            existingProforma.setClient(newClient);
        }

        // Mise à jour des remises globales
        existingProforma.setRemisePourcentage(
                requestDto.getRemisePourcentage() != null ? requestDto.getRemisePourcentage() : 0.0);
        existingProforma.setRemiseFixe(requestDto.getRemiseFixe() != null ? requestDto.getRemiseFixe() : 0.0);

        // Supprimer les anciennes lignes
        proformaVenteLigneRepository.deleteAll(existingProforma.getProformaVenteLignes());

        // Créer les nouvelles lignes
        List<ProformaVenteLigne> nouveLlesLignes = new ArrayList<>();
        for (ProformaVenteLigneDto ligneDto : requestDto.getLignes()) {
            Article article = articleRepository.findById(ligneDto.getArticleId())
                    .orElseThrow(
                            () -> new RuntimeException("Article non trouvé avec l'id: " + ligneDto.getArticleId()));

            ProformaVenteLigne ligne = ProformaVenteLigne.builder()
                    .proforma(existingProforma)
                    .article(article)
                    .quantite(ligneDto.getQuantite())
                    .prixUnitaire(ligneDto.getPrixUnitaire())
                    .remisePourcentage(ligneDto.getRemisePourcentage() != null ? ligneDto.getRemisePourcentage() : 0.0)
                    .remiseFixe(ligneDto.getRemiseFixe() != null ? ligneDto.getRemiseFixe() : 0.0)
                    .build();

            nouveLlesLignes.add(ligne);
        }

        proformaVenteLigneRepository.saveAll(nouveLlesLignes);

        // Recalculer le prix total
        Double tauxTVA = getTauxTVA();
        Double prixTotal = calculatePrixTotal(nouveLlesLignes, existingProforma.getRemisePourcentage(),
                existingProforma.getRemiseFixe(), tauxTVA);
        existingProforma.setPrixTotal(prixTotal);

        ProformaVente updatedProforma = proformaVenteRepository.save(existingProforma);

        // Journalisation
        logAction("UPDATE", oldProforma, updatedProforma, "Modification du pro-forma vente");

        return mapToResponseDto(updatedProforma);
    }

    @Transactional
    public void deleteProformaVente(Integer id) {
        ProformaVente proforma = proformaVenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pro-forma non trouvé avec l'id: " + id));

        // Journalisation avant suppression
        logAction("DELETE", proforma, null, "Suppression du pro-forma vente");

        proformaVenteRepository.delete(proforma);
    }

    // Méthodes utilitaires privées

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

    private Double calculatePrixTotal(List<ProformaVenteLigne> lignes, Double remisePourcentageGlobale,
            Double remiseFixeGlobale, Double tauxTVA) {
        // Calculer le montant brut total (avec remises par ligne)
        double montantNet = 0.0;
        for (ProformaVenteLigne ligne : lignes) {
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

        return Math.round(prixTotal * 100.0) / 100.0; // Arrondir à 2 décimales
    }

    private ProformaVenteResponseDto mapToResponseDto(ProformaVente proforma) {
        Double tauxTVA = getTauxTVA();

        // Mapper les lignes
        List<ProformaVenteLigneDto> lignesDto = proforma.getProformaVenteLignes().stream()
                .map(ligne -> {
                    double montantBrut = ligne.getQuantite() * ligne.getPrixUnitaire();

                    // Calculer remise ligne
                    double montantApresRemisePct = montantBrut;
                    if (ligne.getRemisePourcentage() != null && ligne.getRemisePourcentage() > 0) {
                        montantApresRemisePct = montantBrut * (1 - ligne.getRemisePourcentage() / 100);
                    }

                    double montantNetLigne = montantApresRemisePct;
                    if (ligne.getRemiseFixe() != null && ligne.getRemiseFixe() > 0) {
                        montantNetLigne = Math.max(0, montantApresRemisePct - ligne.getRemiseFixe());
                    }

                    double montantRemise = montantBrut - montantNetLigne;

                    return ProformaVenteLigneDto.builder()
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
                .mapToDouble(ProformaVenteLigneDto::getMontantBrut)
                .sum();

        double montantRemiseLignes = lignesDto.stream()
                .mapToDouble(ProformaVenteLigneDto::getMontantRemise)
                .sum();

        double sousTotal = lignesDto.stream()
                .mapToDouble(ProformaVenteLigneDto::getMontantNet)
                .sum();

        // Calculer remise globale
        double montantApresRemiseGlobalePct = sousTotal;
        if (proforma.getRemisePourcentage() != null && proforma.getRemisePourcentage() > 0) {
            montantApresRemiseGlobalePct = sousTotal * (1 - proforma.getRemisePourcentage() / 100);
        }

        double montantAvantTVA = montantApresRemiseGlobalePct;
        if (proforma.getRemiseFixe() != null && proforma.getRemiseFixe() > 0) {
            montantAvantTVA = Math.max(0, montantApresRemiseGlobalePct - proforma.getRemiseFixe());
        }

        double montantRemiseGlobale = sousTotal - montantAvantTVA;

        double montantTVA = montantAvantTVA * (tauxTVA / 100);

        return ProformaVenteResponseDto.builder()
                .id(proforma.getId())
                .refe(proforma.getRefe())
                .dateEntree(proforma.getDateEntree())
                .clientId(proforma.getClient().getId())
                .clientNom(proforma.getClient().getClientNom())
                .lignes(lignesDto)
                .montantBrutTotal(Math.round(montantBrutTotal * 100.0) / 100.0)
                .montantRemiseLignes(Math.round(montantRemiseLignes * 100.0) / 100.0)
                .sousTotal(Math.round(sousTotal * 100.0) / 100.0)
                .remisePourcentage(proforma.getRemisePourcentage())
                .remiseFixe(proforma.getRemiseFixe())
                .montantRemiseGlobale(Math.round(montantRemiseGlobale * 100.0) / 100.0)
                .montantAvantTVA(Math.round(montantAvantTVA * 100.0) / 100.0)
                .tauxTVA(tauxTVA)
                .montantTVA(Math.round(montantTVA * 100.0) / 100.0)
                .prixTotal(proforma.getPrixTotal())
                .processId(proforma.getProcess().getId())
                .processName(proforma.getProcess().getProcessName())
                .build();
    }

    private ProformaVente copyProforma(ProformaVente source) {
        return ProformaVente.builder()
                .id(source.getId())
                .refe(source.getRefe())
                .client(source.getClient())
                .process(source.getProcess())
                .dateEntree(source.getDateEntree())
                .prixTotal(source.getPrixTotal())
                .remisePourcentage(source.getRemisePourcentage())
                .remiseFixe(source.getRemiseFixe())
                .build();
    }

    private void logAction(String actionName, ProformaVente oldProforma, ProformaVente newProforma, String details) {
        try {
            Action action = actionRepository.findByActionName(actionName)
                    .orElseThrow(() -> new RuntimeException("Action non trouvée: " + actionName));

            Utilisateur utilisateur = getCurrentUser();

            String oldValues = oldProforma != null ? convertProformaToJson(oldProforma) : null;
            String newValues = newProforma != null ? convertProformaToJson(newProforma) : null;
            String idsClasses = newProforma != null ? String.valueOf(newProforma.getId())
                    : (oldProforma != null ? String.valueOf(oldProforma.getId()) : "");

            AuditLog auditLog = AuditLog.builder()
                    .utilisateur(utilisateur)
                    .action(action)
                    .classes("ProformaVente")
                    .idsClasses(idsClasses)
                    .actionTimestamp(LocalDateTime.now())
                    .oldValues(oldValues)
                    .newValues(newValues)
                    .details(details)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Action {} journalisée pour ProformaVente {}", actionName, idsClasses);
        } catch (Exception e) {
            log.error("Erreur lors de la journalisation de l'action {}: {}", actionName, e.getMessage());
        }
    }

    private String convertProformaToJson(ProformaVente proforma) {
        try {
            Map<String, Object> proformaMap = new HashMap<>();
            proformaMap.put("id", proforma.getId());
            proformaMap.put("refe", proforma.getRefe());
            proformaMap.put("clientId", proforma.getClient().getId());
            proformaMap.put("prixTotal", proforma.getPrixTotal());
            proformaMap.put("remisePourcentage", proforma.getRemisePourcentage());
            proformaMap.put("remiseFixe", proforma.getRemiseFixe());
            return objectMapper.writeValueAsString(proformaMap);
        } catch (JsonProcessingException e) {
            log.error("Erreur lors de la conversion du pro-forma en JSON", e);
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

    // ============ MÉTHODES DE WORKFLOW ET VALIDATION ============

    /**
     * 2.3 Validation des remises selon le rôle de l'utilisateur
     */
    private void validateRemises(Double remisePourcentageGlobale, Double remiseFixeGlobale,
            List<ProformaVenteLigneDto> lignes, Utilisateur utilisateur) {
        if (utilisateur == null || utilisateur.getRole() == null) {
            throw new RuntimeException("Utilisateur non authentifié ou sans rôle");
        }

        String roleCode = utilisateur.getRole().getRoleCode();
        Double remiseMax = getRemiseMaxByRole(roleCode);

        // Vérifier remise globale
        if (remisePourcentageGlobale != null && remisePourcentageGlobale > remiseMax) {
            throw new RemiseException(
                    "Remise globale de " + remisePourcentageGlobale + "% dépasse le plafond autorisé de " + remiseMax
                            + "% pour le rôle " + roleCode,
                    remisePourcentageGlobale,
                    remiseMax,
                    roleCode,
                    true);
        }

        // Vérifier remises par ligne
        for (ProformaVenteLigneDto ligne : lignes) {
            if (ligne.getRemisePourcentage() != null && ligne.getRemisePourcentage() > remiseMax) {
                throw new RemiseException(
                        "Remise ligne de " + ligne.getRemisePourcentage() + "% dépasse le plafond autorisé de "
                                + remiseMax + "% pour le rôle " + roleCode,
                        ligne.getRemisePourcentage(),
                        remiseMax,
                        roleCode,
                        true);
            }
        }
    }

    /**
     * Récupérer le plafond de remise selon le rôle
     */
    private Double getRemiseMaxByRole(String roleCode) {
        try {
            String configKey = null;
            // Rôles de vente (30-39)
            if (roleCode.equals("EMP_VENTE")) {
                configKey = "REMISE_MAX_COMMERCIAL";
            } else if (roleCode.equals("RESP_VENTE")) {
                configKey = "REMISE_MAX_RESPONSABLE";
            } else if (roleCode.equals("ADMIN")) {
                return 100.0; // Admin peut tout faire
            } else {
                return 0.0; // Autres rôles: pas de remise
            }

            if (configKey != null) {
                Configuration config = configurationRepository.findByConfigKey(configKey)
                        .orElse(null);
                if (config != null) {
                    return Double.parseDouble(config.getConfigValue());
                }
            }
            return 0.0;
        } catch (NumberFormatException e) {
            log.error("Erreur de parsing du plafond de remise", e);
            return 0.0;
        }
    }

    /**
     * Vérifier si une remise est exceptionnelle (au-delà du plafond normal)
     */
    private boolean isRemiseExceptionnelle(Double remisePourcentage, Utilisateur utilisateur) {
        if (remisePourcentage == null || remisePourcentage == 0 || utilisateur == null) {
            return false;
        }
        Double remiseMax = getRemiseMaxByRole(utilisateur.getRole().getRoleCode());
        return remisePourcentage > remiseMax;
    }

    /**
     * 2.4 Workflow - Changer le statut du pro-forma
     */
    @Transactional
    public ProformaVenteResponseDto changerStatutProforma(Integer proformaId, ProformaVenteWorkflowDto workflowDto) {
        ProformaVente proforma = proformaVenteRepository.findById(proformaId)
                .orElseThrow(() -> new RuntimeException("Pro-forma non trouvé"));

        ProformaVente oldProforma = copyProforma(proforma);
        VenteProcess nouveauProcess = null;

        switch (workflowDto.getAction().toUpperCase()) {
            case "ENVOYER":
                // Brouillon (10) → Envoyé (20)
                if (proforma.getProcess().getValeur() != 10) {
                    throw new RuntimeException("Seul un pro-forma en brouillon peut être envoyé");
                }
                nouveauProcess = venteProcessRepository.findAll().stream()
                        .filter(p -> p.getValeur() == 20)
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Processus 'Envoyé' non trouvé"));
                break;

            case "ACCEPTER":
                // Envoyé (20) → Accepté (30)
                if (proforma.getProcess().getValeur() != 20) {
                    throw new RuntimeException("Seul un pro-forma envoyé peut être accepté");
                }
                nouveauProcess = venteProcessRepository.findAll().stream()
                        .filter(p -> p.getValeur() == 30)
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Processus 'Accepté' non trouvé"));
                break;

            case "REFUSER":
                // Envoyé (20) → Refusé (40)
                if (proforma.getProcess().getValeur() != 20) {
                    throw new RuntimeException("Seul un pro-forma envoyé peut être refusé");
                }
                nouveauProcess = venteProcessRepository.findAll().stream()
                        .filter(p -> p.getValeur() == 40)
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Processus 'Refusé' non trouvé"));
                break;

            case "TRANSFORMER":
                // Accepté (30) → Transformé en commande (50)
                if (proforma.getProcess().getValeur() != 30) {
                    throw new RuntimeException("Seul un pro-forma accepté peut être transformé en commande");
                }
                nouveauProcess = venteProcessRepository.findAll().stream()
                        .filter(p -> p.getValeur() == 50)
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Processus 'Transformé en commande' non trouvé"));

                // Créer la vente depuis le pro-forma
                VenteRequestDto venteRequest = VenteRequestDto.builder()
                        .dateEffective(LocalDate.now())
                        .dateLivraison(null)
                        .locationLivraison(workflowDto.getMotif())
                        .build();

                VenteResponseDto venteCreated = venteService.createFromProforma(proformaId, venteRequest);
                log.info("Pro-forma {} transformé en vente {}", proforma.getRefe(), venteCreated.getRefe());
                
                // Ajouter la référence de la vente créée aux détails
                if (workflowDto.getMotif() == null || workflowDto.getMotif().isEmpty()) {
                    workflowDto.setMotif("Vente créée: " + venteCreated.getRefe());
                } else {
                    workflowDto.setMotif(workflowDto.getMotif() + " | Vente créée: " + venteCreated.getRefe());
                }
                break;

            default:
                throw new RuntimeException("Action inconnue: " + workflowDto.getAction());
        }

        proforma.setProcess(nouveauProcess);
        ProformaVente updatedProforma = proformaVenteRepository.save(proforma);

        String details = "Changement de statut: " + oldProforma.getProcess().getProcessName() + " → "
                + nouveauProcess.getProcessName();
        if (workflowDto.getMotif() != null && !workflowDto.getMotif().isEmpty()) {
            details += " | Motif: " + workflowDto.getMotif();
        }
        logAction("UPDATE", oldProforma, updatedProforma, details);

        return mapToResponseDto(updatedProforma);
    }

    /**
     * 2.5 Contrôles - Vérifier qu'un commercial ne valide pas ses propres remises
     */
    public boolean canUserValidateRemise(Integer proformaId, Utilisateur validateur) {
        ProformaVente proforma = proformaVenteRepository.findById(proformaId)
                .orElseThrow(() -> new RuntimeException("Pro-forma non trouvé"));

        // Récupérer le créateur du pro-forma depuis les logs d'audit
        List<AuditLog> logs = auditLogRepository.findAll().stream()
                .filter(log -> log.getClasses().equals("ProformaVente")
                        && log.getIdsClasses().equals(String.valueOf(proformaId))
                        && log.getAction().getActionName().equals("CREATE"))
                .toList();

        if (!logs.isEmpty()) {
            Utilisateur createur = logs.get(0).getUtilisateur();

            // Un commercial (niveau 30-39) ne peut pas valider ses propres remises
            String createurRoleCode = createur.getRole().getRoleCode();
            if (createurRoleCode.equals("EMP_VENTE") && createur.getId().equals(validateur.getId())) {
                return false;
            }
        }

        return true;
    }

    /**
     * Valider une remise exceptionnelle (nécessite responsable ou admin)
     */
    @Transactional
    public ProformaVenteResponseDto validerRemiseExceptionnelle(Integer proformaId, String motif) {
        Utilisateur validateur = getCurrentUser();

        if (!validateur.getRole().getRoleCode().equals("RESP_VENTE")
                && !validateur.getRole().getRoleCode().equals("ADMIN")) {
            throw new RuntimeException("Seul un responsable ou un admin peut valider une remise exceptionnelle");
        }

        if (!canUserValidateRemise(proformaId, validateur)) {
            throw new RuntimeException("Un commercial ne peut pas valider ses propres remises exceptionnelles");
        }

        ProformaVente proforma = proformaVenteRepository.findById(proformaId)
                .orElseThrow(() -> new RuntimeException("Pro-forma non trouvé"));

        String details = "VALIDATION REMISE EXCEPTIONNELLE - Remise: " + proforma.getRemisePourcentage() + "%";
        if (motif != null && !motif.isEmpty()) {
            details += " | Motif: " + motif;
        }
        details += " | Validé par: " + validateur.getNom();

        logAction("UPDATE", proforma, proforma, details);

        return mapToResponseDto(proforma);
    }
}
