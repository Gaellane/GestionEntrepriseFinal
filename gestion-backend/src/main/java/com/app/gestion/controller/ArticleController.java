package com.app.gestion.controller;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.gestion.dto.stock.ArticleDTO;
import com.app.gestion.model.Article;
import com.app.gestion.service.ArticleService;
import com.app.gestion.dto.achat.ArticleCPL;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {
    @Autowired
    private ArticleService articleService;

    @GetMapping  
    @PreAuthorize("hasAnyAuthority('RESP_MAGASIN','MAGRECEP','MAGSORT','ADMIN','MAGINV')")
    public List<ArticleCPL> getAllArticles() {
        List<ArticleCPL> articles = articleService.getAllCPL();
        for(ArticleCPL a : articles){
            System.out.println("[ArticleService] Article found: " + a.getRefe());
        }
        return (articles);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('RESP_MAGASIN','MAGRECEP','MAGSORT','ADMIN','MAGINV')")
    public ResponseEntity<?> getArticleById(@PathVariable Integer id) {
        try {
            ArticleDTO article = articleService.getArticleById(id);
            return ResponseEntity.ok(article);
            
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Article> createArticle(@RequestBody Article article) {
        Article createdArticle = articleService.createArticle(article);
        return ResponseEntity.ok(createdArticle);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<?> updateArticle(@PathVariable Integer id, @RequestBody Article article) {
        try {
            Article updatedArticle = articleService.updateArticle(id, article);
            return ResponseEntity.ok(updatedArticle);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Void> deleteArticle(@PathVariable Integer id) {
        try {
            articleService.getArticleById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }


}
