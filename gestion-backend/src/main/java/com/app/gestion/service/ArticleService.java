package com.app.gestion.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

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
        return articles.stream().map(a -> ArticleDTO.builder()
                .id(a.getId())
                .refe(a.getRefe())
                .articleNom(a.getArticleNom())
                .valorisation(a.getValorisation())
                .description(a.getDescription())
                .build())
            .collect(Collectors.toList());
    }
}

