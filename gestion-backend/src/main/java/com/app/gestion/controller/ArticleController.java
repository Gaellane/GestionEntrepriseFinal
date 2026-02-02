package com.app.gestion.controller;

import com.app.gestion.dto.ApiResponse;
import com.app.gestion.dto.stock.ArticleDTO;
import com.app.gestion.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ArticleController {

    private final ArticleService articleService;

    /**
     * Récupérer tous les articles avec pagination
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_STOCK', 'EMP_STOCK', 'RESP_VENTE', 'EMP_VENTE', 'RESP_ACHAT', 'EMP_ACHAT')")
    public ResponseEntity<Page<ArticleDTO>> getAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ArticleDTO> articlesPage = articleService.getAllArticles(pageable);

        return ResponseEntity.ok(articlesPage);
    }

    /**
     * Récupérer tous les articles sans pagination
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_STOCK', 'EMP_STOCK', 'RESP_VENTE', 'EMP_VENTE', 'RESP_ACHAT', 'EMP_ACHAT')")
    public ResponseEntity<ApiResponse<List<ArticleDTO>>> getAllArticlesNoPagination() {
        List<ArticleDTO> articles = articleService.getAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Articles récupérés avec succès", articles));
    }

    /**
     * Récupérer un article par ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_STOCK', 'EMP_STOCK', 'RESP_VENTE', 'EMP_VENTE', 'RESP_ACHAT', 'EMP_ACHAT')")
    public ResponseEntity<ApiResponse<ArticleDTO>> getArticleById(@PathVariable Integer id) {
        ArticleDTO article = articleService.getArticleById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Article récupéré avec succès", article));
    }

    /**
     * Rechercher des articles par nom ou référence
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_STOCK', 'EMP_STOCK', 'RESP_VENTE', 'EMP_VENTE', 'RESP_ACHAT', 'EMP_ACHAT')")
    public ResponseEntity<Page<ArticleDTO>> searchArticles(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ArticleDTO> articlesPage = articleService.searchArticles(searchTerm, pageable);

        return ResponseEntity.ok(articlesPage);
    }

    /**
     * Créer un nouvel article
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_STOCK')")
    public ResponseEntity<ApiResponse<ArticleDTO>> createArticle(@RequestBody ArticleDTO articleDTO) {
        ArticleDTO created = articleService.createArticle(articleDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Article créé avec succès", created));
    }

    /**
     * Modifier un article existant
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_STOCK')")
    public ResponseEntity<ApiResponse<ArticleDTO>> updateArticle(
            @PathVariable Integer id,
            @RequestBody ArticleDTO articleDTO) {
        ArticleDTO updated = articleService.updateArticle(id, articleDTO);
        return ResponseEntity.ok(new ApiResponse<>(true, "Article modifié avec succès", updated));
    }

    /**
     * Supprimer un article
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable Integer id) {
        articleService.deleteArticle(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Article supprimé avec succès", null));
    }

    /**
     * Récupérer les articles par catégorie
     */
    @GetMapping("/by-categorie/{categorieId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_STOCK', 'EMP_STOCK', 'RESP_VENTE', 'EMP_VENTE', 'RESP_ACHAT', 'EMP_ACHAT')")
    public ResponseEntity<ApiResponse<List<ArticleDTO>>> getArticlesByCategorie(@PathVariable Integer categorieId) {
        List<ArticleDTO> articles = articleService.getArticlesByCategorie(categorieId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Articles récupérés avec succès", articles));
    }
}
