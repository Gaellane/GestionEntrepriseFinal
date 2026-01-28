package com.app.gestion.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

import com.app.gestion.dto.achat.FournisseurDTO;
import com.app.gestion.service.FournisseurService;

@RestController
@RequestMapping("/api/fournisseurs")
public class FournisseurController {

    @Autowired
    private FournisseurService fournisseurService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getFournisseurById(@PathVariable Integer id) {
        try {
            fournisseurService.getFournisseurById(id);
            return ResponseEntity.ok().build();   
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping
    public ResponseEntity<?> getAllFournisseurs() {
        return ResponseEntity.ok(fournisseurService.getAllFournisseurs());
    }

    @PostMapping
    public ResponseEntity<?> createFournisseur(@RequestBody FournisseurDTO fournisseurDTO) {
        return ResponseEntity.ok(fournisseurService.createFournisseur(fournisseurDTO));
    }
}