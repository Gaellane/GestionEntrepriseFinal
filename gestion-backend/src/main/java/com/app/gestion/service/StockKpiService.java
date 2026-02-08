package com.app.gestion.service;

import com.app.gestion.ai.tool.AiTool;
import com.app.gestion.dto.stock.StockKpiDTO;
import com.app.gestion.model.Article;
import com.app.gestion.model.Lot;
import com.app.gestion.model.InventaireLigne;
import com.app.gestion.repository.LotRepository;
import com.app.gestion.repository.InventaireLigneRepository;
import com.app.gestion.repository.ArticleRepository;
import com.app.gestion.repository.CategorieRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StockKpiService {

    private final LotRepository lotRepository;
    private final InventaireLigneRepository inventaireLigneRepository;
    private final ArticleRepository articleRepository;
    private final CategorieRepository categorieRepository;

    public StockKpiService(LotRepository lotRepository,
                          InventaireLigneRepository inventaireLigneRepository,
                          ArticleRepository articleRepository,
                          CategorieRepository categorieRepository) {
        this.lotRepository = lotRepository;
        this.inventaireLigneRepository = inventaireLigneRepository;
        this.articleRepository = articleRepository;
        this.categorieRepository = categorieRepository;
    }

    @AiTool(
        name = "calculer_precision_stock",
        description = "Calcule le taux de précision du stock en comparant les quantités théoriques (calculées à partir des lots) avec les quantités physiques (mesurées lors des inventaires). Retourne le taux de précision global, les stocks totaux, et un détail par article avec les écarts, valorisations et taux individuels. Filtrable par dépôt, catégorie et période. Indicateur clé pour la gestion des stocks et la détection des anomalies.",
        domain = "stock",
        readOnly = true
    )
    public StockKpiDTO calculateStockPrecision(Integer depotId, Integer categoryId, LocalDateTime dateDebut, LocalDateTime dateFin) {
        // 1. Calculer stock théorique (somme des quantités des lots)
        List<Lot> lots = lotRepository.findAll();
        if (depotId != null) {
            lots = lots.stream()
                    .filter(l -> l.getDepot() != null && depotId.equals(l.getDepot().getId()))
                    .collect(Collectors.toList());
        }
        if (categoryId != null) {
            lots = lots.stream()
                    .filter(l -> l.getArticle() != null 
                            && l.getArticle().getCategorie() != null 
                            && categoryId.equals(l.getArticle().getCategorie().getId()))
                    .collect(Collectors.toList());
        }
        // Filtrer par date d'arrivée (bornes fermées)
        if (dateDebut != null || dateFin != null) {
            lots = lots.stream()
                    .filter(l -> {
                        if (l.getDateArrivee() == null) return false;
                        LocalDateTime dateArrivee = l.getDateArrivee();
                        boolean afterStart = dateDebut == null || !dateArrivee.isBefore(dateDebut);
                        boolean beforeEnd = dateFin == null || !dateArrivee.isAfter(dateFin);
                        return afterStart && beforeEnd;
                    })
                    .collect(Collectors.toList());
        }

        Map<Integer, Double> stockTheoriqueMap = new HashMap<>();
        Map<Integer, Article> articleMap = new HashMap<>();
        
        for (Lot lot : lots) {
            if (lot.getArticle() != null && lot.getQuantiteRestante() != null && lot.getQuantiteRestante() > 0) {
                Integer articleId = lot.getArticle().getId();
                stockTheoriqueMap.put(articleId, 
                    stockTheoriqueMap.getOrDefault(articleId, 0.0) + lot.getQuantiteRestante());
                articleMap.put(articleId, lot.getArticle());
            }
        }

        // 2. Calculer stock physique (dernières lignes d'inventaire)
        List<InventaireLigne> inventaireLignes = inventaireLigneRepository.findAll();
        
        // Filtrer par date si spécifié
        if (dateDebut != null || dateFin != null) {
            inventaireLignes = inventaireLignes.stream()
                    .filter(il -> {
                        if (il.getInventaire() == null || il.getInventaire().getDateEntree() == null) {
                            return false;
                        }
                        LocalDateTime date = il.getInventaire().getDateEntree();
                        boolean afterStart = dateDebut == null || !date.isBefore(dateDebut);
                        boolean beforeEnd = dateFin == null || !date.isAfter(dateFin);
                        return afterStart && beforeEnd;
                    })
                    .collect(Collectors.toList());
        }

        // Filtrer par depot si spécifié
        if (depotId != null) {
            inventaireLignes = inventaireLignes.stream()
                    .filter(il -> il.getInventaire() != null 
                            && il.getInventaire().getDepot() != null
                            && depotId.equals(il.getInventaire().getDepot().getId()))
                    .collect(Collectors.toList());
        }
        // Filtrer par categorie si spécifié
        if (categoryId != null) {
            inventaireLignes = inventaireLignes.stream()
                    .filter(il -> il.getArticle() != null 
                            && il.getArticle().getCategorie() != null
                            && categoryId.equals(il.getArticle().getCategorie().getId()))
                    .collect(Collectors.toList());
        }

        // Grouper par article et prendre la dernière valeur
        Map<Integer, Double> stockPhysiqueMap = new HashMap<>();
        Map<Integer, LocalDateTime> lastInventoryDateMap = new HashMap<>();
        
        for (InventaireLigne ligne : inventaireLignes) {
            if (ligne.getArticle() != null && ligne.getQuantite() != null) {
                Integer articleId = ligne.getArticle().getId();
                LocalDateTime dateInventaire = ligne.getInventaire().getDateEntree();
                
                // Garder seulement la ligne la plus récente pour chaque article
                if (!lastInventoryDateMap.containsKey(articleId) 
                        || dateInventaire.isAfter(lastInventoryDateMap.get(articleId))) {
                    stockPhysiqueMap.put(articleId, ligne.getQuantite());
                    lastInventoryDateMap.put(articleId, dateInventaire);
                    if (!articleMap.containsKey(articleId)) {
                        articleMap.put(articleId, ligne.getArticle());
                    }
                }
            }
        }

        // 3. Comparer et calculer les écarts
        List<StockKpiDTO.ArticleStockComparison> details = new ArrayList<>();
        Double stockTheoriqueTotal = 0.0;
        Double stockPhysiqueTotal = 0.0;

        for (Integer articleId : articleMap.keySet()) {
            Article article = articleMap.get(articleId);
            Double theorique = stockTheoriqueMap.getOrDefault(articleId, 0.0);
            Double physique = stockPhysiqueMap.getOrDefault(articleId, 0.0);
            Double ecart = physique - theorique;
            
            // Calculer le taux de précision pour cet article
            Double tauxPrecision = 0.0;
            if (theorique > 0) {
                tauxPrecision = (physique / theorique) * 100.0;
            }

            // Calculer la valorisation du stock selon la méthode de l'article
            Double valeurStock = calculateStockValuation(articleId, theorique, article.getValorisation(), 
                                                          depotId, dateDebut, dateFin);

            details.add(StockKpiDTO.ArticleStockComparison.builder()
                    .articleId(articleId)
                    .articleNom(article.getArticleNom())
                    .articleRef(article.getRefe())
                    .categoryId(article.getCategorie() != null ? article.getCategorie().getId() : null)
                    .categoryName(article.getCategorie() != null ? article.getCategorie().getCategorieName() : null)
                    .stockTheorique(theorique)
                    .stockPhysique(physique)
                    .ecart(ecart)
                    .tauxPrecision(tauxPrecision)
                    .valorisation(article.getValorisation())
                    .valeurStock(valeurStock)
                    .build());

            stockTheoriqueTotal += theorique;
            stockPhysiqueTotal += physique;
        }

        // 4. Calculer le taux de précision global
        Double tauxPrecisionGlobal = 0.0;
        if (stockTheoriqueTotal > 0) {
            tauxPrecisionGlobal = (stockPhysiqueTotal / stockTheoriqueTotal) * 100.0;
        }

        return StockKpiDTO.builder()
                .tauxPrecision(tauxPrecisionGlobal)
                .stockTheoriqueTotal(stockTheoriqueTotal)
                .stockPhysiqueTotal(stockPhysiqueTotal)
                .details(details)
                .build();
    }

    /**
     * Retourne la liste des articles avec la quantité restante (somme des quantiteRestante des lots)
     * Filtrable par depot et catégorie.
     */
    @AiTool(
        name = "obtenir_stock_restant_par_article",
        description = "Récupère la liste de tous les articles avec leur quantité restante en stock, calculée en additionnant les quantités restantes de tous les lots associés. Permet de filtrer par dépôt et/ou catégorie. Utile pour connaître la disponibilité immédiate des produits et planifier les réapprovisionnements.",
        domain = "stock",
        readOnly = true
    )
    public List<com.app.gestion.dto.stock.ArticleRemainingDTO> getRemainingStockByArticle(Integer depotId, Integer categoryId) {
        List<Lot> lots = lotRepository.findAll();
        if (depotId != null) {
            lots = lots.stream()
                    .filter(l -> l.getDepot() != null && depotId.equals(l.getDepot().getId()))
                    .collect(Collectors.toList());
        }
        if (categoryId != null) {
            lots = lots.stream()
                    .filter(l -> l.getArticle() != null
                            && l.getArticle().getCategorie() != null
                            && categoryId.equals(l.getArticle().getCategorie().getId()))
                    .collect(Collectors.toList());
        }

        Map<Integer, Double> remainingMap = new HashMap<>();
        Map<Integer, Article> articleMap = new HashMap<>();

        for (Lot lot : lots) {
            if (lot.getArticle() != null && lot.getQuantiteRestante() != null && lot.getQuantiteRestante() > 0) {
                Integer articleId = lot.getArticle().getId();
                remainingMap.put(articleId, remainingMap.getOrDefault(articleId, 0.0) + lot.getQuantiteRestante());
                articleMap.putIfAbsent(articleId, lot.getArticle());
            }
        }

        List<com.app.gestion.dto.stock.ArticleRemainingDTO> results = new ArrayList<>();
        for (Integer articleId : articleMap.keySet()) {
            Article article = articleMap.get(articleId);
            Double q = remainingMap.getOrDefault(articleId, 0.0);
            results.add(com.app.gestion.dto.stock.ArticleRemainingDTO.builder()
                    .articleId(articleId)
                    .articleNom(article.getArticleNom())
                    .articleRef(article.getRefe())
                    .categoryId(article.getCategorie() != null ? article.getCategorie().getId() : null)
                    .categoryName(article.getCategorie() != null ? article.getCategorie().getCategorieName() : null)
                    .quantiteRestante(q)
                    .build());
        }

        return results;
    }

    /**
     * Retourne la liste des lots considérés comme "à risque" en fonction d'une date de référence
     * (par défaut la date courante) ou d'un filtre dateFin fourni. Un lot est considéré à risque
     * s'il a une date de péremption non nulle et que sa date de péremption est antérieure ou égale
     * à la date de référence/fin. Les filtres depotId et categoryId sont appliqués.
     */
    public List<com.app.gestion.dto.stock.LotDTO> getRiskyLots(Integer depotId, Integer categoryId, LocalDateTime dateDebut, LocalDateTime dateFin) {
        List<Lot> lots = lotRepository.findAll();
        if (depotId != null) {
            lots = lots.stream()
                    .filter(l -> l.getDepot() != null && depotId.equals(l.getDepot().getId()))
                    .collect(Collectors.toList());
        }
        if (categoryId != null) {
            lots = lots.stream()
                    .filter(l -> l.getArticle() != null
                            && l.getArticle().getCategorie() != null
                            && categoryId.equals(l.getArticle().getCategorie().getId()))
                    .collect(Collectors.toList());
        }

        // Date de référence: dateFin si fournie, sinon maintenant
        LocalDateTime ref = dateFin != null ? dateFin : LocalDateTime.now();

        List<com.app.gestion.dto.stock.LotDTO> results = new ArrayList<>();
        for (Lot lot : lots) {
            if (lot.getQuantiteRestante() == null || lot.getQuantiteRestante() <= 0) continue;
            if (lot.getDatePeremption() == null) continue;

            // Récupérer les paramètres DLUO/DLC depuis la catégorie de l'article
            com.app.gestion.model.Categorie categorie = lot.getArticle() != null ? lot.getArticle().getCategorie() : null;
            Integer dlc = categorie != null ? categorie.getDlc() : null;
            Integer dluo = categorie != null ? categorie.getDluo() : null;

            // Calculer le nombre de jours restants jusqu'à la péremption (référence -> datePeremption)
            long daysRemaining = ChronoUnit.DAYS.between(ref.toLocalDate(), lot.getDatePeremption().toLocalDate());

            // Vérifier si le lot est déjà expiré par rapport à la référence
            boolean isExpired = !lot.getDatePeremption().isAfter(ref);

            boolean dlcRisk = false;
            boolean dluoRisk = false;

            if (dlc != null && dlc > 0) {
                // Si configurée, considérer comme risque si expiration déjà atteinte ou si on est dans la fenêtre définie
                dlcRisk = isExpired || daysRemaining <= dlc;
            }

            if (dluo != null && dluo > 0) {
                // Même logique pour DLUO (alerte)
                dluoRisk = isExpired || daysRemaining <= dluo;
            }

            // Si ni DLUO ni DLC configurés, retomber sur le comportement précédent : notifier uniquement si expiré
            if ((dlc == null || dlc <= 0) && (dluo == null || dluo <= 0)) {
                if (isExpired) {
                    com.app.gestion.dto.stock.LotDTO dto = com.app.gestion.dto.stock.LotDTO.mapToDTO(lot);
                    dto.setAlerte("EXPIRE");
                    results.add(dto);
                    continue;
                } else {
                    // pas de seuil, pas de risque
                    continue;
                }
            }

            // Notifier si l'un ou l'autre critère est atteint
            if (dlcRisk || dluoRisk) {
                com.app.gestion.dto.stock.LotDTO dto = com.app.gestion.dto.stock.LotDTO.mapToDTO(lot);
                StringBuilder sb = new StringBuilder();
                if (dluoRisk) sb.append("DLUO");
                if (dlcRisk) {
                    if (sb.length() > 0) sb.append(",");
                    sb.append("DLC");
                }
                dto.setAlerte(sb.toString());
                results.add(dto);
            }
        }

        return results;
    }

    /**
     * Calcule la valorisation du stock selon la méthode choisie (FIFO, LIFO, CMUP)
     */
    private Double calculateStockValuation(Integer articleId, Double quantiteStock, String methode, 
                                           Integer depotId, LocalDateTime dateDebut, LocalDateTime dateFin) {
        if (quantiteStock == null || quantiteStock <= 0) {
            return 0.0;
        }

        // Récupérer les lots de l'article avec filtres
        List<Lot> articleLots = lotRepository.findAll().stream()
                .filter(l -> l.getArticle() != null && articleId.equals(l.getArticle().getId()))
                .filter(l -> l.getQuantiteRestante() != null && l.getQuantiteRestante() > 0)
                .collect(Collectors.toList());

        // Appliquer les filtres
        if (depotId != null) {
            articleLots = articleLots.stream()
                    .filter(l -> l.getDepot() != null && depotId.equals(l.getDepot().getId()))
                    .collect(Collectors.toList());
        }
        if (dateDebut != null || dateFin != null) {
            articleLots = articleLots.stream()
                    .filter(l -> {
                        if (l.getDateArrivee() == null) return false;
                        LocalDateTime dateArrivee = l.getDateArrivee();
                        boolean afterStart = dateDebut == null || !dateArrivee.isBefore(dateDebut);
                        boolean beforeEnd = dateFin == null || !dateArrivee.isAfter(dateFin);
                        return afterStart && beforeEnd;
                    })
                    .collect(Collectors.toList());
        }

        if (articleLots.isEmpty()) {
            return 0.0;
        }

        // Calculer selon la méthode
        if ("CMUP".equalsIgnoreCase(methode)) {
            // CMUP = Coût Moyen Unitaire Pondéré
            double sommePonderee = 0.0;
            double sommeQuantites = 0.0;
            
            for (Lot lot : articleLots) {
                sommePonderee += lot.getQuantiteRestante() * lot.getPrixUnitaire();
                sommeQuantites += lot.getQuantiteRestante();
            }
            
            if (sommeQuantites > 0) {
                double coutMoyen = sommePonderee / sommeQuantites;
                return quantiteStock * coutMoyen;
            }
            return 0.0;
            
        } else if ("FIFO".equalsIgnoreCase(methode)) {
            // FIFO = First In First Out (lots les plus anciens)
            articleLots.sort((a, b) -> a.getDateArrivee().compareTo(b.getDateArrivee()));
            return calculateValuationByOrder(articleLots, quantiteStock);
            
        } else if ("LIFO".equalsIgnoreCase(methode)) {
            // LIFO = Last In First Out (lots les plus récents)
            articleLots.sort((a, b) -> b.getDateArrivee().compareTo(a.getDateArrivee()));
            return calculateValuationByOrder(articleLots, quantiteStock);
        }

        return 0.0;
    }

    /**
     * Calcule la valorisation en prenant les lots dans l'ordre (FIFO ou LIFO)
     */
    private Double calculateValuationByOrder(List<Lot> sortedLots, Double quantiteStock) {
        double valeur = 0.0;
        double quantiteRestante = quantiteStock;

        for (Lot lot : sortedLots) {
            if (quantiteRestante <= 0) break;

            double quantiteAPrendre = Math.min(quantiteRestante, lot.getQuantiteRestante());
            valeur += quantiteAPrendre * lot.getPrixUnitaire();
            quantiteRestante -= quantiteAPrendre;
        }

        return valeur;
    }
}
