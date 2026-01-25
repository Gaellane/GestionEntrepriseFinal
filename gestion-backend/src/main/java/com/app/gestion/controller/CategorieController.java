package com.app.gestion.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;

import com.app.gestion.service.CategorieService;
import com.app.gestion.model.Categorie;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategorieController {
    
    @Autowired
    private CategorieService categorieService;

    @GetMapping
    public ResponseEntity<List<Categorie>> getAllCategories() {
        List<Categorie> categories = categorieService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Categorie> getCategorieById(@PathVariable Integer id) throws Exception {
        Categorie categorie = categorieService.getCategorieById(id);
        return ResponseEntity.ok(categorie);
    }

    @PostMapping
    public ResponseEntity<Categorie> createCategorie(@RequestBody Categorie categorie) {
        Categorie createdCategorie = categorieService.createCategorie(categorie);
        return ResponseEntity.ok(createdCategorie);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categorie> updateCategorie(@PathVariable Integer id, @RequestBody Categorie categorieDetails) throws Exception {
        Categorie updatedCategorie = categorieService.updateCategorie(id, categorieDetails);
        return ResponseEntity.ok(updatedCategorie);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategorie(@PathVariable Integer id) throws Exception {
        categorieService.deleteCategorie(id);
        return ResponseEntity.noContent().build();
    }
}