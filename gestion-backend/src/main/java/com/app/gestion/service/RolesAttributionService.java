package com.app.gestion.service;

import com.app.gestion.dto.RolesAttributionHistoriqueDto;
import com.app.gestion.model.Role;
import com.app.gestion.model.RolesAttributionHistorique;
import com.app.gestion.model.RolesAttributionProcess;
import com.app.gestion.model.Utilisateur;
import com.app.gestion.repository.RoleRepository;
import com.app.gestion.repository.RolesAttributionHistoriqueRepository;
import com.app.gestion.repository.RolesAttributionProcessRepository;
import com.app.gestion.repository.UtilisateurRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolesAttributionService {

    private final RolesAttributionHistoriqueRepository rolesAttributionHistoriqueRepository;
    private final RolesAttributionProcessRepository rolesAttributionProcessRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public RolesAttributionHistoriqueDto assignRole(Integer utilisateurId, Integer roleId) throws Exception {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new Exception("Utilisateur introuvable"));
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new Exception("Rôle introuvable"));
        
        RolesAttributionProcess process = rolesAttributionProcessRepository.findByValeur(1)
                .orElseThrow(() -> new Exception("Process de création introuvable"));

        RolesAttributionHistorique historique = RolesAttributionHistorique.builder()
                .utilisateur(utilisateur)
                .role(role)
                .process(process)
                .dateEntree(LocalDateTime.now())
                .build();

        RolesAttributionHistorique saved = rolesAttributionHistoriqueRepository.save(historique);
        return convertToDto(saved);
    }

    @Transactional
    public RolesAttributionHistoriqueDto validateRoleAttribution(Integer historiqueId) throws Exception {
        RolesAttributionHistorique historique = rolesAttributionHistoriqueRepository.findById(historiqueId)
                .orElseThrow(() -> new Exception("Attribution de rôle introuvable"));

        RolesAttributionProcess validationProcess = rolesAttributionProcessRepository.findByValeur(2)
                .orElseThrow(() -> new Exception("Process de validation introuvable"));

        // Mettre à jour le process à validation
        historique.setProcess(validationProcess);
        
        // Mettre à jour le rôle de l'utilisateur
        Utilisateur utilisateur = historique.getUtilisateur();
        utilisateur.setRole(historique.getRole());
        utilisateurRepository.save(utilisateur);

        RolesAttributionHistorique updated = rolesAttributionHistoriqueRepository.save(historique);
        return convertToDto(updated);
    }

    @Transactional
    public RolesAttributionHistoriqueDto rejectRoleAttribution(Integer historiqueId) throws Exception {
        RolesAttributionHistorique historique = rolesAttributionHistoriqueRepository.findById(historiqueId)
                .orElseThrow(() -> new Exception("Attribution de rôle introuvable"));

        RolesAttributionProcess rejectProcess = rolesAttributionProcessRepository.findByValeur(3)
                .orElseThrow(() -> new Exception("Process de rejet introuvable"));

        historique.setProcess(rejectProcess);
        RolesAttributionHistorique updated = rolesAttributionHistoriqueRepository.save(historique);
        return convertToDto(updated);
    }

    public List<RolesAttributionHistoriqueDto> getAttributionsByProcess(Integer processId) {
        List<RolesAttributionHistorique> historiques = rolesAttributionHistoriqueRepository.findByProcessId(processId);
        return historiques.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<RolesAttributionHistoriqueDto> getAttributionsByUser(Integer utilisateurId) {
        List<RolesAttributionHistorique> historiques = rolesAttributionHistoriqueRepository.findByUtilisateurId(utilisateurId);
        return historiques.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public RolesAttributionHistoriqueDto getAttributionById(Integer id) throws Exception {
        RolesAttributionHistorique historique = rolesAttributionHistoriqueRepository.findById(id)
                .orElseThrow(() -> new Exception("Attribution de rôle introuvable"));
        return convertToDto(historique);
    }

    private RolesAttributionHistoriqueDto convertToDto(RolesAttributionHistorique historique) {
        return RolesAttributionHistoriqueDto.builder()
                .id(historique.getId())
                .utilisateurId(historique.getUtilisateur().getId())
                .utilisateurEmail(historique.getUtilisateur().getEmail())
                .utilisateurNom(historique.getUtilisateur().getNom())
                .roleId(historique.getRole().getId())
                .roleCode(historique.getRole().getRoleCode())
                .roleName(historique.getRole().getRoleName())
                .processId(historique.getProcess() != null ? historique.getProcess().getId() : null)
                .processName(historique.getProcess() != null ? historique.getProcess().getProcessName() : null)
                .processAbreviation(historique.getProcess() != null ? historique.getProcess().getAbreviation() : null)
                .dateEntree(historique.getDateEntree())
                .build();
    }
}
