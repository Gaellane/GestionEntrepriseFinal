package com.app.gestion.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.app.gestion.repository.CategorieRepository;
import com.app.gestion.model.Categorie;

import java.util.List;

@Service
public class CategorieService {

    @Autowired
    private CategorieRepository categorieRepository;

    public List<Categorie> getAllCategories() {
        return categorieRepository.findAll();
    }

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
