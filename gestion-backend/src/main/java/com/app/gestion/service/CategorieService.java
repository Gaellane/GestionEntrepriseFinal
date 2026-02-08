package com.app.gestion.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.app.gestion.ai.tool.AiTool;
import com.app.gestion.repository.CategorieRepository;
import com.app.gestion.model.Categorie;

import java.util.List;

@Service
public class CategorieService {

    @Autowired
    private CategorieRepository categorieRepository;

    @AiTool(
        name = "recuperer_toutes_categories",
        description = "Récupère la liste complète de toutes les catégories d'articles configurées dans le système (ex: électronique, alimentaire, fournitures, etc.). Chaque catégorie contient un nom et une description. Permet de connaître les types de produits gérés et de classifier les articles.",
        domain = "stock",
        readOnly = true
    )
    public List<Categorie> getAllCategories() {
        return categorieRepository.findAll();
    }

    @AiTool(
        name = "recuperer_categorie_par_id",
        description = "Récupère les informations détaillées d'une catégorie d'articles spécifique à partir de son identifiant unique. Retourne le nom de la catégorie et sa description.",
        domain = "stock",
        readOnly = true
    )
    public Categorie getCategorieById(Integer id) throws Exception {
        return categorieRepository.findById(id)
                .orElseThrow(() -> new Exception("Catégorie avec l'id :" + id + " introuvable"));
    }

    public Categorie createCategorie(Categorie categorie) {
        return categorieRepository.save(categorie);
    }

    public Categorie updateCategorie(Integer id, Categorie categorieDetails) throws Exception {
        Categorie categorie = getCategorieById(id);
        categorie.setCategorieName(categorieDetails.getCategorieName());
        categorie.setDescription(categorieDetails.getDescription());
        return categorieRepository.save(categorie);
    }

    public void deleteCategorie(Integer id) throws Exception {
        Categorie categorie = getCategorieById(id);
        categorieRepository.delete(categorie);
    }

}
