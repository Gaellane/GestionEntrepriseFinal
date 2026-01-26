package com.app.gestion.controller;

import com.app.gestion.dto.ApiResponse;
import com.app.gestion.dto.CategorieDTO;
import com.app.gestion.service.CategorieService;
import com.app.gestion.repository.CategorieRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategorieController {

    @Autowired
    private CategorieService categorieService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('RESP_MAGASIN','MAGRECEP','MAGSORT','ADMIN','MAGINV')")
    public ApiResponse<List<CategorieDTO>> getAllCategories() {
        try {
            System.out.println("[CategorieController] Loading all categories...");
            List<CategorieDTO> categories = categorieService.getAllCategories().stream()
                    .map(cat -> CategorieDTO.builder()
                            .id(cat.getId())
                            .categorieName(cat.getCategorieName())
                            .description(cat.getDescription())
                            .build())
                    .collect(Collectors.toList());
            System.out.println("[CategorieController] Found " + categories.size() + " categories");
            return new ApiResponse<>(true, "OK", categories);
        } catch (Exception e) {
            System.err.println("[CategorieController] Error: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Erreur lors de la récupération des catégories: " + e.getMessage(), null);
        }
    }
}
