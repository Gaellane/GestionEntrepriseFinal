package com.app.gestion.service;

import com.app.gestion.ai.tool.AiTool;
import com.app.gestion.dto.tarification.ArticlePrixRequestDto;
import com.app.gestion.dto.tarification.ArticlePrixResponseDto;
import com.app.gestion.dto.tarification.ArticleTarifHistoriqueDto;
import com.app.gestion.model.*;
import com.app.gestion.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TarificationService {

    private final ArticlePrixRepository articlePrixRepository;
    private final ArticleEntityRepository articleEntityRepository;
    private final AuditLogRepository auditLogRepository;
    private final ActionRepository actionRepository;


    @Transactional(readOnly = true)
    public List<ArticlePrixResponseDto> getAllPrixByEntityId(Integer entityId) {
        List<ArticlePrix> prixList = articlePrixRepository.findAllByEntityId(entityId);
        return prixList.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @AiTool(
        name = "obtenir_historique_prix_article",
        description = "Récupère l'historique complet des prix d'un article pour une entité spécifique. Retourne la liste chronologique de tous les changements de prix avec leurs dates, le prix actuel, et les informations de l'article (nom, référence). Permet de suivre l'évolution tarifaire d'un produit au fil du temps.",
        domain = "tarification",
        readOnly = true
    )
    @Transactional(readOnly = true)
    public ArticleTarifHistoriqueDto getHistoriquePrixByArticleEntity(Integer articleEntityId) {
        ArticleEntity articleEntity = articleEntityRepository.findById(articleEntityId)
                .orElseThrow(() -> new RuntimeException("ArticleEntity non trouvé avec l'id: " + articleEntityId));

        List<ArticlePrix> historique = articlePrixRepository.findByArticleEntityOrderByDateEntreeDesc(articleEntity);

        List<ArticlePrixResponseDto> historiqueDtos = historique.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        Double prixActuel = historique.isEmpty() ? null : historique.get(0).getPrix();

        return ArticleTarifHistoriqueDto.builder()
                .articleEntityId(articleEntity.getId())
                .articleNom(articleEntity.getArticle().getArticleNom())
                .articleReference(articleEntity.getArticle().getRefe())
                .entityName(articleEntity.getEntity().getEntityName())
                .prixActuel(prixActuel)
                .historique(historiqueDtos)
                .build();
    }

    @Transactional(readOnly = true)
    public ArticlePrixResponseDto getPrixActuel(Integer articleEntityId) {
        ArticlePrix prix = articlePrixRepository.findLatestPrixByArticleEntityId(articleEntityId)
                .orElseThrow(() -> new RuntimeException("Aucun prix trouvé pour cet article"));
        return mapToResponseDto(prix);
    }

    @AiTool(
        name = "obtenir_dernier_prix_article",
        description = "Récupère le prix de vente actuel (le plus récent) d'un article à partir de son identifiant. Retourne le prix unitaire en vigueur, utilisé pour les devis et commandes. Recherche automatiquement l'entité active associée à l'article pour obtenir le tarif applicable.",
        domain = "tarification",
        readOnly = true
    )
    @Transactional(readOnly = true)
    public ArticlePrixResponseDto getLatestPrixByArticleId(Integer articleId) {
        // Récupérer l'ArticleEntity actif pour cet article
        ArticleEntity articleEntity = articleEntityRepository.findActiveByArticleId(articleId)
                .orElseThrow(() -> new RuntimeException("Aucune entité active trouvée pour cet article"));
        
        // Récupérer le dernier prix pour cette ArticleEntity
        ArticlePrix prix = articlePrixRepository.findLatestPrixByArticleEntityId(articleEntity.getId())
                .orElse(null);
        
        if (prix == null) {
            // Retourner un prix par défaut si aucun prix n'est trouvé
            return ArticlePrixResponseDto.builder()
                    .articleEntityId(articleEntity.getId())
                    .articleNom(articleEntity.getArticle().getArticleNom())
                    .articleReference(articleEntity.getArticle().getRefe())
                    .entityName(articleEntity.getEntity().getEntityName())
                    .prix(0.0)
                    .prixVente(0.0)
                    .dateEntree(LocalDateTime.now())
                    .build();
        }
        
        return mapToResponseDtoWithPrixVente(prix);
    }

    @Transactional
    public ArticlePrixResponseDto ajouterNouveauPrix(ArticlePrixRequestDto requestDto) {
        ArticleEntity articleEntity = articleEntityRepository.findById(requestDto.getArticleEntityId())
                .orElseThrow(() -> new RuntimeException("ArticleEntity non trouvé"));

        // Récupérer l'ancien prix pour l'audit
        ArticlePrix ancienPrix = articlePrixRepository
                .findLatestPrixByArticleEntityId(requestDto.getArticleEntityId())
                .orElse(null);

        ArticlePrix nouveauPrix = ArticlePrix.builder()
                .articleEntity(articleEntity)
                .prix(requestDto.getPrix())
                .dateEntree(LocalDateTime.now())
                .build();

        ArticlePrix savedPrix = articlePrixRepository.save(nouveauPrix);

        // Journalisation
        String details = String.format("Ajout nouveau prix pour l'article '%s' (Entité: %s). ",
                articleEntity.getArticle().getArticleNom(),
                articleEntity.getEntity().getEntityName());

        if (ancienPrix != null) {
            details += String.format("Ancien prix: %.2f, Nouveau prix: %.2f",
                    ancienPrix.getPrix(), savedPrix.getPrix());
        } else {
            details += String.format("Premier prix: %.2f", savedPrix.getPrix());
        }

        logAction("CREATE", null, savedPrix, details);

        return mapToResponseDto(savedPrix);
    }

    @Transactional
    public ArticlePrixResponseDto updatePrix(Integer prixId, ArticlePrixRequestDto requestDto) {
        ArticlePrix existingPrix = articlePrixRepository.findById(prixId)
                .orElseThrow(() -> new RuntimeException("Prix non trouvé avec l'id: " + prixId));

        // Sauvegarder l'ancien état
        ArticlePrix oldPrix = ArticlePrix.builder()
                .id(existingPrix.getId())
                .articleEntity(existingPrix.getArticleEntity())
                .prix(existingPrix.getPrix())
                .dateEntree(existingPrix.getDateEntree())
                .build();

        // Mise à jour
        existingPrix.setPrix(requestDto.getPrix());

        ArticlePrix updatedPrix = articlePrixRepository.save(existingPrix);

        // Journalisation
        String details = String.format("Modification du prix pour l'article '%s'. Ancien: %.2f, Nouveau: %.2f",
                existingPrix.getArticleEntity().getArticle().getArticleNom(),
                oldPrix.getPrix(),
                updatedPrix.getPrix());

        logAction("UPDATE", oldPrix, updatedPrix, details);

        return mapToResponseDto(updatedPrix);
    }

    @Transactional
    public void deletePrix(Integer prixId) {
        ArticlePrix prix = articlePrixRepository.findById(prixId)
                .orElseThrow(() -> new RuntimeException("Prix non trouvé avec l'id: " + prixId));

        String details = String.format("Suppression du prix pour l'article '%s' (%.2f)",
                prix.getArticleEntity().getArticle().getArticleNom(),
                prix.getPrix());

        logAction("DELETE", prix, null, details);

        articlePrixRepository.delete(prix);
    }

    // Méthodes utilitaires privées

    private ArticlePrixResponseDto mapToResponseDto(ArticlePrix prix) {
        return ArticlePrixResponseDto.builder()
                .id(prix.getId())
                .articleEntityId(prix.getArticleEntity().getId())
                .articleNom(prix.getArticleEntity().getArticle().getArticleNom())
                .articleReference(prix.getArticleEntity().getArticle().getRefe())
                .entityName(prix.getArticleEntity().getEntity().getEntityName())
                .prix(prix.getPrix())
                .prixVente(prix.getPrix()) // Par défaut, prixVente = prix
                .dateEntree(prix.getDateEntree())
                .build();
    }

    private ArticlePrixResponseDto mapToResponseDtoWithPrixVente(ArticlePrix prix) {
        return ArticlePrixResponseDto.builder()
                .id(prix.getId())
                .articleEntityId(prix.getArticleEntity().getId())
                .articleNom(prix.getArticleEntity().getArticle().getArticleNom())
                .articleReference(prix.getArticleEntity().getArticle().getRefe())
                .entityName(prix.getArticleEntity().getEntity().getEntityName())
                .prix(prix.getPrix())
                .prixVente(prix.getPrix()) // Utiliser le prix comme prix de vente
                .dateEntree(prix.getDateEntree())
                .build();
    }

    private void logAction(String actionName, ArticlePrix oldPrix, ArticlePrix newPrix, String details) {
        try {
            Action action = actionRepository.findByActionName(actionName)
                    .orElseThrow(() -> new RuntimeException("Action non trouvée: " + actionName));

            Utilisateur utilisateur = getCurrentUser();

            String oldValues = oldPrix != null ? convertPrixToJson(oldPrix) : null;
            String newValues = newPrix != null ? convertPrixToJson(newPrix) : null;
            String idsClasses = newPrix != null ? String.valueOf(newPrix.getId())
                    : (oldPrix != null ? String.valueOf(oldPrix.getId()) : "");

            AuditLog auditLog = AuditLog.builder()
                    .utilisateur(utilisateur)
                    .action(action)
                    .classes("ArticlePrix")
                    .idsClasses(idsClasses)
                    .actionTimestamp(LocalDateTime.now())
                    .oldValues(oldValues)
                    .newValues(newValues)
                    .details(details)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Action {} journalisée pour ArticlePrix {}", actionName, idsClasses);
        } catch (Exception e) {
            log.error("Erreur lors de la journalisation de l'action {}: {}", actionName, e.getMessage());
        }
    }

    private String convertPrixToJson(ArticlePrix prix) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();    
            Map<String, Object> prixMap = new HashMap<>();
            prixMap.put("id", prix.getId());
            prixMap.put("articleEntityId", prix.getArticleEntity().getId());
            prixMap.put("prix", prix.getPrix());
            prixMap.put("dateEntree", prix.getDateEntree().toString());
            return objectMapper.writeValueAsString(prixMap);
        } catch (JsonProcessingException e) {
            log.error("Erreur lors de la conversion du prix en JSON", e);
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
}
