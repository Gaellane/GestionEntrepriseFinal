package com.app.gestion.service;

import com.app.gestion.dto.livraison.*;
import com.app.gestion.model.*;
import com.app.gestion.repository.*;
import com.app.gestion.utilitaire.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
    private final VenteHistoriqueRepository venteHistoriqueRepository;
    private final LotRepository lotRepository;
    private final ArticleRepository articleRepository;
    private final LotService lotService;
    private final UtilisateurRepository utilisateurRepository;
    private final RaisonMouvementRepository raisonMouvementRepository;
    private final StockReservationService stockReservationService;

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
                if (ligneDto.getArticleId() == null) {
                    log.error("ID article null dans la requête de livraison pour la ligne: {}", ligneDto);
                    continue;
                }
                
                Article article = articleRepository.findById(ligneDto.getArticleId())
                        .orElseThrow(() -> new RuntimeException("Article non trouvé: " + ligneDto.getArticleId()));

                // Vérifier que la quantité ne dépasse pas la quantité de la vente
                VenteLigne venteLigne = venteLignes.stream()
                        .filter(vl -> vl.getArticle() != null && vl.getArticle().getId() != null 
                                    && vl.getArticle().getId().equals(ligneDto.getArticleId()))
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
                if (venteLigne.getArticle() == null || venteLigne.getArticle().getId() == null) {
                    log.error("Article ou ID article null dans la ligne de vente ID: {}", 
                             venteLigne.getId());
                    continue;
                }
                
                LivraisonVenteLigne ligne = LivraisonVenteLigne.builder()
                        .livraison(savedLivraison)
                        .article(venteLigne.getArticle())
                        .quantite(venteLigne.getQuantite())
                        .build();
                livraisonLignes.add(ligne);
            }
        }

        if (livraisonLignes.isEmpty()) {
            // Si aucune ligne valide, créer des lignes à partir des venteLignes avec articleId explicite
            log.warn("Aucune ligne de livraison créée, tentative de récupération depuis les lignes de vente");
            for (VenteLigne venteLigne : venteLignes) {
                if (venteLigne.getArticle() != null && venteLigne.getArticle().getId() != null) {
                    LivraisonVenteLigne ligne = LivraisonVenteLigne.builder()
                            .livraison(savedLivraison)
                            .article(venteLigne.getArticle())
                            .quantite(venteLigne.getQuantite())
                            .build();
                    livraisonLignes.add(ligne);
                }
            }
            
            if (livraisonLignes.isEmpty()) {
                throw new RuntimeException("Aucune ligne de livraison valide trouvée - vérifiez que les articles existent dans la vente");
            }
        }

        livraisonVenteLigneRepository.saveAll(livraisonLignes);

        // Libérer les réservations de stock avant la sortie physique
        try {
            stockReservationService.libererReservationsVente(vente.getId(), "Libération pour livraison " + reference);
            log.info("Réservations libérées pour vente {} avant sortie de stock", vente.getRefe());
        } catch (Exception e) {
            log.warn("Erreur lors de la libération des réservations pour vente {}: {}", vente.getRefe(), e.getMessage());
            // On continue quand même car les réservations peuvent déjà être libérées ou inexistantes
        }

        // Sortie des lots selon les sélections de l'utilisateur
        if (requestDto.getLignes() != null && !requestDto.getLignes().isEmpty()) {
            System.out.println("MIDITRA ATO AM SELECTIONNES");
            sortirLotsSelectionnes(requestDto.getLignes(), savedLivraison);
        } else {
            // Si pas de sélection spécifique, sortir automatiquement selon la méthode de valorisation
            sortirLotsAutomatiquement(livraisonLignes, savedLivraison);
        }

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
                        Integer ligneId,
                        Integer depotId,
                        String methode) {

                // tenter d'abord de récupérer une ligne de livraison (id de livraison_ligne)
                Integer articleId = null;
                var livLigneOpt = livraisonVenteLigneRepository.findById(ligneId);
                if (livLigneOpt.isPresent()) {
                        articleId = livLigneOpt.get().getArticle().getId();
                } else {
                        // fallback: peut être un id de vente_ligne (avant création de la livraison)
                        var venteLigneOpt = venteLigneRepository.findById(ligneId);
                        if (venteLigneOpt.isPresent()) {
                                articleId = venteLigneOpt.get().getArticle().getId();
                        } else {
                                throw new RuntimeException("Ligne non trouvée (ni livraison ni vente) pour id: " + ligneId);
                        }
                }

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
     * Valider/Terminer une livraison
     */
    @Transactional
    public LivraisonVenteResponseDto validerLivraison(Integer livraisonId) {
        LivraisonVente livraison = livraisonVenteRepository.findById(livraisonId)
                .orElseThrow(() -> new RuntimeException("Livraison non trouvée: " + livraisonId));
        
        // Vérifier que la livraison est en préparation
        if (livraison.getProcess().getValeur() != 10) {
            throw new RuntimeException("Seule une livraison 'En préparation' peut être validée. " +
                    "État actuel: " + livraison.getProcess().getProcessName());
        }
        
        // Récupérer le processus "Livrée" (valeur 50)
        LivraisonVenteProcess processLivree = livraisonVenteProcessRepository.findByValeur(50)
                .orElseThrow(() -> new RuntimeException("Processus 'Livrée' non trouvé"));
        
        // Mettre à jour le statut
        livraison.setProcess(processLivree);
        LivraisonVente savedLivraison = livraisonVenteRepository.save(livraison);
        
        // Historiser le changement
        historiserChangementStatut(savedLivraison, processLivree);
        
        log.info("Livraison {} validée avec succès", livraison.getRefe());
        
        // Vérifier si toutes les livraisons de la vente sont terminées
        Integer venteId = savedLivraison.getVente().getId();
        if (toutesLivraisonsTerminees(venteId)) {
            marquerVenteCommeLivree(venteId);
        }
        
        return mapToResponseDto(savedLivraison);
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

    /**     * Vérifier si toutes les livraisons d'une vente sont terminées et validées
     * Une vente est considérée comme entièrement livrée si :
     * 1. Toutes ses lignes ont été livrées (somme des quantités livrées >= quantité commandée)
     * 2. Toutes les livraisons associées sont validées (processus valeur = 50)
     */
    private boolean toutesLivraisonsTerminees(Integer venteId) {
        // Récupérer toutes les lignes de la vente
        List<VenteLigne> venteLignes = venteLigneRepository.findAll().stream()
                .filter(vl -> vl.getVente().getId().equals(venteId))
                .toList();
        
        // Récupérer toutes les livraisons de cette vente
        List<LivraisonVente> livraisons = livraisonVenteRepository.findAll().stream()
                .filter(lv -> lv.getVente().getId().equals(venteId))
                .toList();
        
        // Vérifier que toutes les livraisons sont validées (valeur = 50)
        boolean toutesLivraisonsValidees = livraisons.stream()
                .allMatch(lv -> lv.getProcess().getValeur().equals(50));
        
        if (!toutesLivraisonsValidees || livraisons.isEmpty()) {
            return false;
        }
        
        // Vérifier que chaque ligne de vente est entièrement livrée
        for (VenteLigne venteLigne : venteLignes) {
            Double quantiteCommandee = venteLigne.getQuantite();
            
            // Calculer la somme des quantités livrées pour cet article
            Double quantiteLivree = 0.0;
            for (LivraisonVente livraison : livraisons) {
                List<LivraisonVenteLigne> lignesLivraison = livraisonVenteLigneRepository.findAll().stream()
                        .filter(ll -> ll.getLivraison().getId().equals(livraison.getId())
                                && ll.getArticle().getId().equals(venteLigne.getArticle().getId()))
                        .toList();
                
                quantiteLivree += lignesLivraison.stream()
                        .mapToDouble(LivraisonVenteLigne::getQuantite)
                        .sum();
            }
            
            // Si une ligne n'est pas entièrement livrée, retourner false
            if (quantiteLivree < quantiteCommandee) {
                log.debug("Article {} pas entièrement livré: commandé={}, livré={}",
                        venteLigne.getArticle().getArticleNom(), quantiteCommandee, quantiteLivree);
                return false;
            }
        }
        
        log.info("Toutes les livraisons de la vente {} sont terminées et validées", venteId);
        return true;
    }
    
    /**
     * Changer le statut d'une vente en "Livrée" (valeur 90)
     */
    private void marquerVenteCommeLivree(Integer venteId) {
        Vente vente = venteRepository.findById(venteId)
                .orElseThrow(() -> new RuntimeException("Vente non trouvée: " + venteId));
        
        // Récupérer le processus "Livrée" (valeur 90)
        VenteProcess processLivree = venteProcessRepository.findByValeur(90)
                .orElseThrow(() -> new RuntimeException("Processus vente 'Livrée' non trouvé"));
        
        // Mettre à jour le statut de la vente
        vente.setProcess(processLivree);
        venteRepository.save(vente);
        
        // Historiser le changement (vous pourriez avoir besoin d'adapter selon votre modèle)
        // Ajouter un enregistrement dans vente_historiques
        VenteHistorique vh = VenteHistorique.builder()
            .vente(vente)
            .process(processLivree)
            .dateEntree(LocalDateTime.now())
            .build();
        venteHistoriqueRepository.save(vh);
        
        log.info("Vente {} marquée comme livrée (statut: {})", vente.getRefe(), processLivree.getProcessName());
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

    /**
     * Sortir les lots selon les sélections spécifiques de l'utilisateur
     */
    private void sortirLotsSelectionnes(List<LivraisonVenteLigneDto> lignesRequest, LivraisonVente livraison) {
        for (LivraisonVenteLigneDto ligneRequest : lignesRequest) {
            try {
                // Résoudre l'article depuis la requête. La front peut envoyer soit `articleId`, soit `id` (livraisonLigneId)
                Article article = null;
                Double quantite = ligneRequest.getQuantite();

                if (ligneRequest.getArticleId() != null) {
                    article = articleRepository.findById(ligneRequest.getArticleId())
                            .orElseThrow(() -> new RuntimeException("Article non trouvé: " + ligneRequest.getArticleId()));
                } else if (ligneRequest.getId() != null) {
                    // Si l'API client envoie la sélection en utilisant l'id de la ligne de livraison
                    var livLigneOpt = livraisonVenteLigneRepository.findById(ligneRequest.getId());
                    if (livLigneOpt.isPresent()) {
                        var livLigne = livLigneOpt.get();
                        article = livLigne.getArticle();
                        if (quantite == null) quantite = livLigne.getQuantite();
                    } else {
                        log.error("Ligne de livraison introuvable pour id: {}", ligneRequest.getId());
                        continue;
                    }
                } else {
                    log.error("ID article et ID ligne null dans la requête de livraison: {}", ligneRequest);
                    continue;
                }

                if (article == null || article.getId() == null) {
                    log.error("Article résolu null pour la requête de livraison: {}", ligneRequest);
                    continue;
                }
                
                Integer depotId = 1; // Dépôt par défaut
                
                // Récupérer l'utilisateur connecté et la raison
                Integer userId = getCurrentUserId();
                Integer raisonId = getRaisonLivraisonId();
                
                if (userId == null) {
                    log.warn("Utilisateur connecté non trouvé, utilisation ID par défaut");
                    userId = 1; // ID utilisateur par défaut
                }
                
                if (raisonId == null) {
                    log.warn("Raison livraison non trouvée, utilisation ID par défaut");
                    raisonId = 1; // ID raison par défaut
                }
                
                // Vérifier qu'il y a des lots disponibles avant la sortie
                log.info("Vérification des lots disponibles pour article ID: {} dans dépôt ID: {}", 
                    article.getId(), depotId);
                
                // Utiliser directement la méthode sortirStock de LotService 
                // qui gère automatiquement la méthode de valorisation (FIFO/LIFO/CMUP)
                if (quantite == null || quantite <= 0) {
                    log.warn("Quantité invalide pour article {} dans livraison {} : {}", article.getId(), livraison.getRefe(), quantite);
                    continue;
                }

                log.info("Tentative de sortie de stock - Article: {}, Quantité: {}, Dépôt: {}, UserId: {}, RaisonId: {}", 
                    article.getId(), quantite, depotId, userId, raisonId);

                try {
                    lotService.sortirStock(
                        article.getId(),
                        quantite,
                        depotId,
                        "Sortie pour livraison " + livraison.getRefe(),
                        raisonId,
                        userId
                    );
                    
                    log.info("Sortie de stock réussie - {} unités pour article {} dans livraison {} (méthode valorisation: {})", 
                        quantite, article.getArticleNom(), livraison.getRefe(), 
                        article.getValorisation());
                } catch (Exception lotException) {
                    log.error("Erreur spécifique lors de la sortie de stock pour article {}: {}", 
                        article.getArticleNom(), lotException.getMessage(), lotException);
                    throw lotException;
                }
                
            } catch (Exception e) {
                log.error("Erreur lors de la sortie des lots pour la requête {} : {}", 
                    ligneRequest, e.getMessage());
                throw new RuntimeException("Erreur lors de la sortie des lots: " + e.getMessage(), e);
            }
        }
    }

    /**
     * Sortir les lots automatiquement selon la méthode de valorisation de l'article
     */
    private void sortirLotsAutomatiquement(List<LivraisonVenteLigne> livraisonLignes, LivraisonVente livraison) {
        for (LivraisonVenteLigne livraisonLigne : livraisonLignes) {
            try {
                Article article = livraisonLigne.getArticle();
                if (article == null || article.getId() == null) {
                    log.error("Article null ou ID article null pour la ligne de livraison");
                    continue;
                }
                
                Integer depotId = 1; // Dépôt par défaut
                
                // Récupérer l'utilisateur connecté et la raison
                Integer userId = getCurrentUserId();
                Integer raisonId = getRaisonLivraisonId();
                
                if (userId == null) {
                    log.warn("Utilisateur connecté non trouvé, utilisation ID par défaut");
                    userId = 1; // ID utilisateur par défaut
                }
                
                if (raisonId == null) {
                    log.warn("Raison livraison non trouvée, utilisation ID par défaut");
                    raisonId = 1; // ID raison par défaut
                }
                
                // Utiliser directement la méthode sortirStock de LotService 
                // qui gère automatiquement la méthode de valorisation (FIFO/LIFO/CMUP)
                log.info("Tentative de sortie de stock automatique - Article: {}, Quantité: {}, Dépôt: {}, UserId: {}, RaisonId: {}", 
                    article.getId(), livraisonLigne.getQuantite(), depotId, userId, raisonId);
                
                lotService.sortirStock(
                    article.getId(),
                    livraisonLigne.getQuantite(),
                    depotId,
                    "Sortie pour livraison " + livraison.getRefe(),
                    raisonId,
                    userId
                );
                
                log.info("Sortie automatique réussie - {} unités pour article {} dans livraison {} (méthode valorisation: {})", 
                    livraisonLigne.getQuantite(), article.getArticleNom(), livraison.getRefe(), 
                    article.getValorisation());
                    
            } catch (Exception e) {
                log.error("Erreur lors de la sortie automatique pour article {} : {}", 
                    livraisonLigne.getArticle() != null ? livraisonLigne.getArticle().getArticleNom() : "N/A", 
                    e.getMessage());
                throw new RuntimeException("Erreur lors de la sortie automatique: " + e.getMessage(), e);
            }
        }
    }

    /**
     * Récupérer l'ID de l'utilisateur connecté
     */
    private Integer getCurrentUserId() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            if ("anonymousUser".equals(username)) {
                log.warn("Utilisateur anonyme détecté, utilisation ID par défaut");
                return 1;
            }
            
            Optional<Utilisateur> userOpt = utilisateurRepository.findByEmail(username);
            if (userOpt.isPresent()) {
                return userOpt.get().getId();
            } else {
                log.warn("Utilisateur non trouvé pour email: {}", username);
                return 1; // ID utilisateur par défaut
            }
        } catch (Exception e) {
            log.warn("Impossible de récupérer l'utilisateur connecté: {}", e.getMessage());
            return 1; // ID utilisateur par défaut
        }
    }

    /**
     * Récupérer l'ID de la raison de mouvement pour livraison/vente
     */
    private Integer getRaisonLivraisonId() {
        try {
            var raisonOpt = raisonMouvementRepository.findAll().stream()
                .filter(r -> r.getRaisonName().toLowerCase().contains("livraison") 
                           || r.getRaisonName().toLowerCase().contains("vente")
                           || r.getRaisonName().toLowerCase().contains("commande"))
                .findFirst();
            if (raisonOpt.isPresent()) {
                return raisonOpt.get().getId();
            } else {
                // Fallback: prendre la première raison disponible
                var firstRaison = raisonMouvementRepository.findAll().stream().findFirst();
                if (firstRaison.isPresent()) {
                    log.warn("Raison livraison spécifique non trouvée, utilisation de: {}", firstRaison.get().getRaisonName());
                    return firstRaison.get().getId();
                }
                return 1; // ID raison par défaut
            }
        } catch (Exception e) {
            log.warn("Impossible de récupérer la raison livraison: {}", e.getMessage());
            return 1; // ID raison par défaut
        }
    }
}
