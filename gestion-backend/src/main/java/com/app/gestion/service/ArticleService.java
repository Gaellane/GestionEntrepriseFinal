package com.app.gestion.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.app.gestion.repository.ArticleRepository;
import com.app.gestion.model.Article;
import com.app.gestion.model.Categorie;
import com.app.gestion.model.Unite;

import java.util.List;

import com.app.gestion.utilitaire.ReferenceGenerator;

@Service
public class ArticleService {
    
    @Autowired
    private ArticleRepository articleRepository;

    public Article getArticleById(Integer id) throws Exception {
        return articleRepository.findById(id)
                .orElseThrow(() -> new Exception("Article avec l'id :" + id + " introuvable"));
    }

    public Article getArticleByRefe(String refe) throws Exception {
        return articleRepository.findByRefe(refe)
                .orElseThrow(() -> new Exception("Article avec la référence :" + refe + " introuvable"));
    }

    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    public Article createArticle(Article article) {
        String reference = ReferenceGenerator.generateReference("ART-");
        while(isRefeExists(reference)) {
            reference = ReferenceGenerator.generateReference("ART-");
        }
        article.setRefe(reference);
        return articleRepository.save(article);
    }

    public Article updateArticle(Integer id, Article articleDetails) throws Exception {
        Article article = getArticleById(id);
        
        // if (articleDetails.getRefe() != null) {
        //     article.setRefe(articleDetails.getRefe());
        // }
        
        if (articleDetails.getArticleNom() != null) {
            article.setArticleNom(articleDetails.getArticleNom());
        }
        
        if (articleDetails.getValorisation() != null) {
            article.setValorisation(articleDetails.getValorisation());
        }
        
        if (articleDetails.getDescription() != null) {
            article.setDescription(articleDetails.getDescription());
        }
        
        if (articleDetails.getCategorie() != null) {
            article.setCategorie(articleDetails.getCategorie());
        }
        
        if (articleDetails.getUnite() != null) {
            article.setUnite(articleDetails.getUnite());
        }
        
        return articleRepository.save(article);
    }

    public void deleteArticle(Integer id) throws Exception {
        Article article = getArticleById(id);
        articleRepository.delete(article);
    }

    // Méthode pour vérifier si une référence existe déjà
    public boolean isRefeExists(String refe) {
        return articleRepository.existsByRefe(refe);
    }

    
}