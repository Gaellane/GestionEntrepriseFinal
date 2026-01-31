package com.app.gestion.controller;

import com.app.gestion.dto.ApiResponse;
import com.app.gestion.dto.RoleDto;
import com.app.gestion.service.RoleService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    /**
     * Récupère tous les rôles
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMINSYS')")
    public ApiResponse<List<RoleDto>> getAllRoles() {
        try {
            System.out.println("[RoleController] Fetching all roles");
            List<RoleDto> roles = roleService.getAllRoles();
            return new ApiResponse<>(true, "OK", roles);
        } catch (Exception e) {
            System.err.println("[RoleController] Error: " + e.getMessage());
            return new ApiResponse<>(false, "Erreur: " + e.getMessage(), null);
        }
    }

    /**
     * Récupère un rôle par ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMINSYS')")
    public ApiResponse<RoleDto> getRoleById(@PathVariable Integer id) {
        try {
            System.out.println("[RoleController] Fetching role " + id);
            RoleDto role = roleService.getRoleById(id);
            return new ApiResponse<>(true, "OK", role);
        } catch (Exception e) {
            System.err.println("[RoleController] Error: " + e.getMessage());
            return new ApiResponse<>(false, "Erreur: " + e.getMessage(), null);
        }
    }
}
