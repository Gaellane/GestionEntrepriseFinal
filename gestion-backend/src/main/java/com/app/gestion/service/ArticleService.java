package com.app.gestion.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.app.gestion.dto.achat.ArticleCPL;
import com.app.gestion.dto.stock.ArticleDTO;
import com.app.gestion.model.Article;
import com.app.gestion.repository.ArticleRepository;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    public List<ArticleDTO> getAll() {
        List<Article> articles = articleRepository.findAll();
        List<ArticleDTO> articleDTOs = articles.stream()
        .map(ArticleDTO::mapToDTO)
        .collect(Collectors.toList());
        return articleDTOs;
    }

    public List<ArticleCPL> getAllCPL() {
        List<Article> articles = articleRepository.findAllWithRelations();
        List<ArticleCPL> articleCPLs = articles.stream()
        .map(ArticleCPL::mapToDTO)
        .collect(Collectors.toList());
        return articleCPLs;
    }

    public ArticleDTO getArticleById(Integer id) throws Exception {
         Article article = articleRepository.findById(id)
                .orElseThrow(() -> new Exception("Article not found with id: " + id));
         return ArticleDTO.mapToDTO(article);
    }

    public Article createArticle(Article article) {
        return articleRepository.save(article);
    }   

    public Article updateArticle(Integer id, Article articleDetails) throws Exception {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new Exception("Article not found with id: " + id));

        article.setRefe(articleDetails.getRefe());
        article.setArticleNom(articleDetails.getArticleNom());
        article.setValorisation(articleDetails.getValorisation());
        article.setDescription(articleDetails.getDescription());

        return articleRepository.save(article);
    }

    public void deleteArticle(Integer id) {
        articleRepository.deleteById(id);
    }
}

