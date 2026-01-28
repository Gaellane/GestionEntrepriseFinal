package com.app.gestion.service;

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
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    /**
     * Récupère un rôle par ID
     */
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
