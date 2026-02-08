package com.app.gestion.service;

import com.app.gestion.ai.tool.AiTool;
import com.app.gestion.dto.RoleDto;
import com.app.gestion.model.Role;
import com.app.gestion.repository.RoleRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    /**
     * Récupère tous les rôles
     */
    @AiTool(
        name = "recuperer_tous_roles",
        description = "Récupère la liste complète de tous les rôles utilisateur configurés dans le système (ex: Administrateur, Magasinier, Responsable Commercial, Financier, etc.). Chaque rôle contient son nom, code, niveau d'accès et département associé. Permet de connaître les rôles disponibles pour l'attribution aux utilisateurs.",
        domain = "admin",
        readOnly = true
    )
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    /**
     * Récupère un rôle par ID
     */
    @AiTool(
        name = "recuperer_role_par_id",
        description = "Récupère les informations détaillées d'un rôle utilisateur spécifique à partir de son identifiant unique. Retourne le nom du rôle, son code, son niveau d'accès et le département associé.",
        domain = "admin",
        readOnly = true
    )
    public RoleDto getRoleById(Integer id) {
        return roleRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé avec ID: " + id));
    }

    /**
     * Convertit une entité Role en DTO
     */
    private RoleDto convertToDto(Role role) {
        return RoleDto.builder()
                .id(role.getId())
                .roleName(role.getRoleName())
                .roleCode(role.getRoleCode())
                .niveauAcces(role.getNiveauAcces())
                .departmentId(role.getDepartment() != null ? role.getDepartment().getId() : null)
                .build();
    }
}
