package com.app.gestion.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.gestion.ai.tool.AiTool;
import com.app.gestion.dto.stock.ArticleDTO;
import com.app.gestion.model.Article;
import com.app.gestion.model.Categorie;
import com.app.gestion.model.Unite;
import com.app.gestion.repository.ArticleRepository;
import com.app.gestion.repository.CategorieRepository;
import com.app.gestion.repository.UniteRepository;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final CategorieRepository categorieRepository;
    private final UniteRepository uniteRepository;

    public ArticleService(ArticleRepository articleRepository,
                          CategorieRepository categorieRepository,
                          UniteRepository uniteRepository) {
        this.articleRepository = articleRepository;
        this.categorieRepository = categorieRepository;
        this.uniteRepository = uniteRepository;
    }

    /**
     * Récupérer tous les articles sans pagination
     */
    @AiTool(
        name = "recuperer_tous_articles",
        description = "Récupère la liste complète de tous les articles du catalogue avec leurs informations détaillées (référence, nom, catégorie, unité, valorisation, description). Utile pour obtenir un aperçu global du catalogue produits.",
        domain = "stock",
        readOnly = true
    )
    public List<ArticleDTO> getAll() {
        List<Article> articles = articleRepository.findAllWithRelations();
        return articles.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer tous les articles avec pagination
     */
    public Page<ArticleDTO> getAllArticles(Pageable pageable) {
        Page<Article> articles = articleRepository.findAll(pageable);
        return articles.map(this::convertToDTO);
    }

    /**
     * Récupérer un article par ID
     */
    @AiTool(
        name = "recuperer_article_par_id",
        description = "Récupère les informations détaillées d'un article spécifique à partir de son identifiant unique (ID). Retourne la référence, le nom, la catégorie, l'unité de mesure, la valorisation et la description de l'article.",
        domain = "stock",
        readOnly = true
    )
    public ArticleDTO getArticleById(Integer id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article non trouvé avec l'ID: " + id));
        return convertToDTO(article);
    }

    /**
     * Rechercher des articles par nom ou référence
     */
    @AiTool(
        name = "rechercher_articles",
        description = "Recherche des articles dans le catalogue en utilisant un terme de recherche qui peut correspondre au nom de l'article ou à sa référence. Permet de filtrer rapidement le catalogue pour trouver des produits spécifiques. Supporte la pagination des résultats.",
        domain = "stock",
        readOnly = true
    )
    public Page<ArticleDTO> searchArticles(String searchTerm, Pageable pageable) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllArticles(pageable);
        }
        Page<Article> articles = articleRepository.searchArticles(searchTerm, pageable);
        return articles.map(this::convertToDTO);
    }

    /**
     * Créer un nouvel article
     */
    @AiTool(
        name = "creer_article",
        description = "Crée un nouvel article dans le catalogue avec sa référence unique, son nom, sa catégorie, son unité de mesure, sa valorisation et sa description. Vérifie que la référence n'existe pas déjà dans le système avant la création.",
        domain = "stock",
        readOnly = false,
        dangerous = false
    )
    @Transactional
    public ArticleDTO createArticle(ArticleDTO articleDTO) {
        // Vérifier si la référence existe déjà
        if (articleRepository.findByRefe(articleDTO.getRefe()).isPresent()) {
            throw new IllegalArgumentException("Un article avec cette référence existe déjà: " + articleDTO.getRefe());
        }

        Article article = new Article();
        article.setRefe(articleDTO.getRefe());
        article.setArticleNom(articleDTO.getArticleNom());
        article.setValorisation(articleDTO.getValorisation());
        article.setDescription(articleDTO.getDescription());

        // Associer la catégorie si fournie
        if (articleDTO.getCategorieId() != null) {
            Categorie categorie = categorieRepository.findById(articleDTO.getCategorieId())
                    .orElseThrow(() -> new IllegalArgumentException("Catégorie non trouvée: " + articleDTO.getCategorieId()));
            article.setCategorie(categorie);
        }

        // Associer l'unité si fournie
        if (articleDTO.getUniteId() != null) {
            Unite unite = uniteRepository.findById(articleDTO.getUniteId())
                    .orElseThrow(() -> new IllegalArgumentException("Unité non trouvée: " + articleDTO.getUniteId()));
            article.setUnite(unite);
        }

        Article saved = articleRepository.save(article);
        return convertToDTO(saved);
    }

    /**
     * Modifier un article existant
     */
    @Transactional
    public ArticleDTO updateArticle(Integer id, ArticleDTO articleDTO) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article non trouvé avec l'ID: " + id));

        // Vérifier si la nouvelle référence n'est pas déjà utilisée par un autre article
        if (!article.getRefe().equals(articleDTO.getRefe())) {
            articleRepository.findByRefe(articleDTO.getRefe()).ifPresent(existingArticle -> {
                if (!existingArticle.getId().equals(id)) {
                    throw new IllegalArgumentException("Un autre article utilise déjà cette référence: " + articleDTO.getRefe());
                }
            });
        }

        article.setRefe(articleDTO.getRefe());
        article.setArticleNom(articleDTO.getArticleNom());
        article.setValorisation(articleDTO.getValorisation());
        article.setDescription(articleDTO.getDescription());

        // Mettre à jour la catégorie
        if (articleDTO.getCategorieId() != null) {
            Categorie categorie = categorieRepository.findById(articleDTO.getCategorieId())
                    .orElseThrow(() -> new IllegalArgumentException("Catégorie non trouvée: " + articleDTO.getCategorieId()));
            article.setCategorie(categorie);
        } else {
            article.setCategorie(null);
        }

        // Mettre à jour l'unité
        if (articleDTO.getUniteId() != null) {
            Unite unite = uniteRepository.findById(articleDTO.getUniteId())
                    .orElseThrow(() -> new IllegalArgumentException("Unité non trouvée: " + articleDTO.getUniteId()));
            article.setUnite(unite);
        } else {
            article.setUnite(null);
        }

        Article updated = articleRepository.save(article);
        return convertToDTO(updated);
    }

    /**
     * Supprimer un article
     */
    @Transactional
    public void deleteArticle(Integer id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article non trouvé avec l'ID: " + id));
        
        // Vérifier si l'article est utilisé dans des transactions
        if (article.getLots() != null && !article.getLots().isEmpty()) {
            throw new IllegalStateException("Impossible de supprimer l'article car il possède des lots associés");
        }
        
        articleRepository.delete(article);
    }

    /**
     * Récupérer les articles par catégorie
     */
    @AiTool(
        name = "recuperer_articles_par_categorie",
        description = "Récupère tous les articles appartenant à une catégorie spécifique. Permet de filtrer le catalogue par type de produit (ex: électronique, alimentaire, etc.). Retourne la liste complète des articles de la catégorie demandée.",
        domain = "stock",
        readOnly = true
    )
    public List<ArticleDTO> getArticlesByCategorie(Integer categorieId) {
        List<Article> articles = articleRepository.findByCategorieId(categorieId);
        return articles.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convertir une entité Article en DTO
     */
    private ArticleDTO convertToDTO(Article article) {
        ArticleDTO dto = ArticleDTO.builder()
                .id(article.getId())
                .refe(article.getRefe())
                .articleNom(article.getArticleNom())
                .valorisation(article.getValorisation())
                .description(article.getDescription())
                .build();

        if (article.getCategorie() != null) {
            dto.setCategorieId(article.getCategorie().getId());
            dto.setCategorieName(article.getCategorie().getCategorieName());
        }

        if (article.getUnite() != null) {
            dto.setUniteId(article.getUnite().getId());
            dto.setUniteName(article.getUnite().getUniteName());
        }

        return dto;
    }
}
