package com.app.gestion.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public ArticleDTO getArticleById(Integer id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article non trouvé avec l'ID: " + id));
        return convertToDTO(article);
    }

    /**
     * Rechercher des articles par nom ou référence
     */
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
