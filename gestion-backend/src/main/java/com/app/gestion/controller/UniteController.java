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

import com.app.gestion.service.UniteService;

import com.app.gestion.model.Unite;

import java.util.List;

@RestController
@RequestMapping("/api/unites")
public class UniteController {
    
    @Autowired
    private UniteService uniteService;

    @GetMapping
    public ResponseEntity<List<Unite>> getAllUnites() {
        List<Unite> unites = uniteService.getAllUnites();
        return ResponseEntity.ok(unites);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Unite> getUniteById(@PathVariable Integer id) throws Exception {
        Unite unite = uniteService.getUniteById(id);
        return ResponseEntity.ok(unite);
    }

    @PostMapping
    public ResponseEntity<Unite> createUnite(@RequestBody Unite unite) {
        Unite createdUnite = uniteService.createUnite(unite);
        return ResponseEntity.ok(createdUnite);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Unite> updateUnite(@PathVariable Integer id, @RequestBody Unite uniteDetails) throws Exception {
        Unite updatedUnite = uniteService.updateUnite(id, uniteDetails);
        return ResponseEntity.ok(updatedUnite);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnite(@PathVariable Integer id) throws Exception {
        uniteService.deleteUnite(id);
        return ResponseEntity.noContent().build();
    }

    
}