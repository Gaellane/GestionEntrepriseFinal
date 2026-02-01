package com.app.gestion.service;

import com.app.gestion.dto.livraison.*;
import com.app.gestion.model.*;
import com.app.gestion.repository.*;
import com.app.gestion.utilitaire.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service de gestion des livraisons de vente
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LivraisonVenteService {

    private final LivraisonVenteRepository livraisonVenteRepository;
    private final LivraisonVenteLigneRepository livraisonVenteLigneRepository;
    private final LivraisonVenteProcessRepository livraisonVenteProcessRepository;
    private final LivraisonVenteHistoriqueRepository livraisonVenteHistoriqueRepository;
    private final VenteRepository venteRepository;
    private final VenteLigneRepository venteLigneRepository;
    private final VenteProcessRepository venteProcessRepository;
    private final LotRepository lotRepository;
    private final ArticleRepository articleRepository;

    /**
     * 4.2 - Lister les commandes à préparer (ventes avec process_id = Confirmée)
     */
    @Transactional(readOnly = true)
    public List<VenteAPreparerDto> getVentesAPreparer() {
        // Trouver toutes les ventes confirmées (process_id = 60)
        List<Vente> ventesConfirmees = venteRepository.findAll().stream()
                .filter(v -> v.getProcess().getValeur().equals(60))
                .toList();

        return ventesConfirmees.stream().map(vente -> {
            // Compter le nombre de lignes
            long nombreLignes = venteLigneRepository.findAll().stream()
                    .filter(l -> l.getVente().getId().equals(vente.getId()))
                    .count();

            // Vérifier si une livraison existe déjà
            boolean aLivraisonExistante = livraisonVenteRepository.existsByVenteId(vente.getId());

            return VenteAPreparerDto.builder()
                    .venteId(vente.getId())
                    .venteRefe(vente.getRefe())
                    .clientNom(vente.getProforma() != null ? vente.getProforma().getClient().getClientNom() : "N/A")
                    .processName(vente.getProcess().getProcessName())
                    .processValeur(vente.getProcess().getValeur())
                    .prixTotal(vente.getPrixTotal())
                    .nombreLignes((int) nombreLignes)
                    .locationLivraison(vente.getLocationLivraison())
                    .dateLivraison(vente.getDateLivraison() != null ? vente.getDateLivraison().toString() : null)
                    .aLivraisonExistante(aLivraisonExistante)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * 4.2 - Créer une livraison depuis une vente confirmée
     * État initial: En préparation (valeur 10)
     * Copie les lignes de vente_lignes vers livraison_vente_lignes
     * Permet modification des quantités pour livraison partielle
     */
    @Transactional
    public LivraisonVenteResponseDto creerLivraison(LivraisonVenteRequestDto requestDto) {
        // Récupérer la vente
        Vente vente = venteRepository.findById(requestDto.getVenteId())
                .orElseThrow(() -> new RuntimeException("Vente non trouvée: " + requestDto.getVenteId()));

        // 4.2 - Vérifier que la vente est Confirmée
        if (vente.getProcess().getValeur() != 60) {
            throw new RuntimeException("Seule une vente Confirmée peut être mise en livraison. " +
                    "État actuel: " + vente.getProcess().getProcessName());
        }

        // Récupérer le processus "En préparation" (valeur 10)
        LivraisonVenteProcess processEnPreparation = livraisonVenteProcessRepository.findByValeur(10)
                .orElseThrow(() -> new RuntimeException("Processus 'En préparation' non trouvé"));

        // Générer référence unique: LIV-YYYY-MM-DD-XXXXX
        String reference = ReferenceGenerator.generateReference("LIV-");

        // Créer la livraison
        LivraisonVente livraison = LivraisonVente.builder()
                .vente(vente)
                .process(processEnPreparation)
                .dateEntree(LocalDateTime.now())
                .refe(reference)
                .build();

        LivraisonVente savedLivraison = livraisonVenteRepository.save(livraison);

        // 4.2 - Copier les lignes de vente_lignes vers livraison_vente_lignes
        List<VenteLigne> venteLignes = venteLigneRepository.findAll().stream()
                .filter(l -> l.getVente().getId().equals(vente.getId()))
                .toList();

        List<LivraisonVenteLigne> livraisonLignes = new ArrayList<>();

        if (requestDto.getLignes() != null && !requestDto.getLignes().isEmpty()) {
            // 4.2 - Livraison partielle: utiliser les quantités spécifiées
            for (LivraisonVenteLigneDto ligneDto : requestDto.getLignes()) {
                Article article = articleRepository.findById(ligneDto.getArticleId())
                        .orElseThrow(() -> new RuntimeException("Article non trouvé: " + ligneDto.getArticleId()));

                // Vérifier que la quantité ne dépasse pas la quantité de la vente
                VenteLigne venteLigne = venteLignes.stream()
                        .filter(vl -> vl.getArticle().getId().equals(ligneDto.getArticleId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Article non trouvé dans la vente"));

                if (ligneDto.getQuantite() > venteLigne.getQuantite()) {
                    throw new RuntimeException(String.format(
                            "Quantité de livraison (%s) supérieure à la quantité de vente (%s) pour l'article %s",
                            ligneDto.getQuantite(), venteLigne.getQuantite(), article.getArticleNom()));
                }

                LivraisonVenteLigne ligne = LivraisonVenteLigne.builder()
                        .livraison(savedLivraison)
                        .article(article)
                        .quantite(ligneDto.getQuantite())
                        .build();
                livraisonLignes.add(ligne);
            }
        } else {
            // Livraison complète: copier toutes les lignes avec les mêmes quantités
            for (VenteLigne venteLigne : venteLignes) {
                LivraisonVenteLigne ligne = LivraisonVenteLigne.builder()
                        .livraison(savedLivraison)
                        .article(venteLigne.getArticle())
                        .quantite(venteLigne.getQuantite())
                        .build();
                livraisonLignes.add(ligne);
            }
        }

        livraisonVenteLigneRepository.saveAll(livraisonLignes);

        // Historiser la création
        historiserChangementStatut(savedLivraison, processEnPreparation);

        // Mettre à jour l'état de la vente vers "En préparation" (70)
        VenteProcess processVenteEnPreparation = venteProcessRepository.findByValeur(70)
                .orElseThrow(() -> new RuntimeException("Processus vente 'En préparation' non trouvé"));
        vente.setProcess(processVenteEnPreparation);
        venteRepository.save(vente);

        log.info("Livraison {} créée pour vente {} avec {} lignes",
                reference, vente.getRefe(), livraisonLignes.size());

        return mapToResponseDto(savedLivraison);
    }

    /**
     * 4.3 - Obtenir les lots disponibles pour une ligne de livraison
     * Méthode FIFO (First In First Out) ou FEFO (First Expired First Out)
     */
    @Transactional(readOnly = true)
    public List<LotDisponibleDto> getLotsDisponiblesPourLigne(
            Integer livraisonLigneId,
            Integer depotId,
            String methode) {

        // Récupérer la ligne de livraison
        LivraisonVenteLigne ligne = livraisonVenteLigneRepository.findById(livraisonLigneId)
                .orElseThrow(() -> new RuntimeException("Ligne de livraison non trouvée: " + livraisonLigneId));

        Integer articleId = ligne.getArticle().getId();

        // 4.3 - Vérifier si l'article a des produits périssables
        boolean estPerissable = lotRepository.hasLotsPerissables(articleId);

        // 4.3 - Sélectionner la méthode appropriée
        List<Lot> lots;
        if ("FEFO".equalsIgnoreCase(methode) || estPerissable) {
            // 4.3 - FEFO pour produits périssables
            lots = lotRepository.findLotsDisponiblesFEFO(articleId, depotId);
        } else {
            // 4.3 - FIFO par défaut
            lots = lotRepository.findLotsDisponiblesFIFO(articleId, depotId);
        }

        // Convertir en DTO
        return lots.stream().map(lot -> {
            boolean expire = lot.getDatePeremption() != null &&
                    lot.getDatePeremption().isBefore(LocalDateTime.now());

            Integer joursAvantExpiration = null;
            if (lot.getDatePeremption() != null && !expire) {
                joursAvantExpiration = (int) ChronoUnit.DAYS.between(
                        LocalDateTime.now(), lot.getDatePeremption());
            }

            return LotDisponibleDto.builder()
                    .lotId(lot.getId())
                    .articleId(lot.getArticle().getId())
                    .articleNom(lot.getArticle().getArticleNom())
                    .depotId(lot.getDepot().getId())
                    .depotNom(lot.getDepot().getDepotName())
                    .quantiteRestante(lot.getQuantiteRestante())
                    .dateArrivee(lot.getDateArrivee())
                    .datePeremption(lot.getDatePeremption())
                    .prixUnitaire(lot.getPrixUnitaire())
                    .estPerissable(lot.getDatePeremption() != null)
                    .estExpire(expire)
                    .joursAvantExpiration(joursAvantExpiration)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * 4.3 - Interface de préparation: afficher toutes les lignes d'une livraison
     * avec les lots disponibles
     */
    @Transactional(readOnly = true)
    public LivraisonVenteResponseDto getLivraisonAvecLotsDisponibles(
            Integer livraisonId,
            Integer depotId) {

        LivraisonVente livraison = livraisonVenteRepository.findById(livraisonId)
                .orElseThrow(() -> new RuntimeException("Livraison non trouvée: " + livraisonId));

        LivraisonVenteResponseDto dto = mapToResponseDto(livraison);

        // Pour chaque ligne, ajouter les informations des lots disponibles
        for (LivraisonVenteLigneDto ligneDto : dto.getLignes()) {
            log.debug("Ligne {} - Article: {}, Quantité à préparer: {}",
                    ligneDto.getId(), ligneDto.getArticleNom(), ligneDto.getQuantite());
        }

        return dto;
    }

    /**
     * Récupérer une livraison par ID
     */
    @Transactional(readOnly = true)
    public LivraisonVenteResponseDto getLivraisonById(Integer id) {
        LivraisonVente livraison = livraisonVenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Livraison non trouvée: " + id));
        return mapToResponseDto(livraison);
    }

    /**
     * Lister toutes les livraisons
     */
    @Transactional(readOnly = true)
    public List<LivraisonVenteResponseDto> getAllLivraisons() {
        return livraisonVenteRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Historiser un changement de statut
     */
    private void historiserChangementStatut(LivraisonVente livraison, LivraisonVenteProcess process) {
        LivraisonVenteHistorique historique = LivraisonVenteHistorique.builder()
                .livraison(livraison)
                .process(process)
                .dateEntree(LocalDateTime.now())
                .build();

        livraisonVenteHistoriqueRepository.save(historique);
        log.debug("Historique créé pour livraison {} - processus: {}",
                livraison.getRefe(), process.getProcessName());
    }

    /**
     * Mapper une entité vers DTO
     */
    private LivraisonVenteResponseDto mapToResponseDto(LivraisonVente livraison) {
        List<LivraisonVenteLigne> lignes = livraisonVenteLigneRepository.findAll().stream()
                .filter(l -> l.getLivraison().getId().equals(livraison.getId()))
                .toList();

        // Récupérer les lignes de vente pour comparaison
        List<VenteLigne> venteLignes = venteLigneRepository.findAll().stream()
                .filter(vl -> vl.getVente().getId().equals(livraison.getVente().getId()))
                .toList();

        List<LivraisonVenteLigneDto> lignesDto = lignes.stream().map(ligne -> {
            // Trouver la quantité dans la vente d'origine
            Double quantiteVente = venteLignes.stream()
                    .filter(vl -> vl.getArticle().getId().equals(ligne.getArticle().getId()))
                    .findFirst()
                    .map(VenteLigne::getQuantite)
                    .orElse(ligne.getQuantite());

            return LivraisonVenteLigneDto.builder()
                    .id(ligne.getId())
                    .articleId(ligne.getArticle().getId())
                    .articleNom(ligne.getArticle().getArticleNom())
                    .articleReference(ligne.getArticle().getRefe())
                    .quantite(ligne.getQuantite())
                    .quantiteVente(quantiteVente)
                    .build();
        }).collect(Collectors.toList());

        return LivraisonVenteResponseDto.builder()
                .id(livraison.getId())
                .refe(livraison.getRefe())
                .venteId(livraison.getVente().getId())
                .venteRefe(livraison.getVente().getRefe())
                .clientNom(livraison.getVente().getProforma() != null
                        ? livraison.getVente().getProforma().getClient().getClientNom()
                        : "N/A")
                .processName(livraison.getProcess().getProcessName())
                .processValeur(livraison.getProcess().getValeur())
                .dateEntree(livraison.getDateEntree())
                .lignes(lignesDto)
                .build();
    }
}
