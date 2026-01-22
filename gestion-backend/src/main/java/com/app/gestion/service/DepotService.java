package com.app.gestion.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.app.gestion.dto.stock.DepotDTO;
import com.app.gestion.model.Depot;
import com.app.gestion.model.EntityDepot;
import com.app.gestion.repository.DepotRepository;
import com.app.gestion.repository.EntityDepotRepository;

@Service
public class DepotService {

    private final DepotRepository depotRepository;
    private final EntityDepotRepository entityDepotRepository;
    private final UtilisateurService utilisateurService;

    public DepotService(DepotRepository depotRepository, EntityDepotRepository entityDepotRepository, UtilisateurService utilisateurService) {
        this.depotRepository = depotRepository;
        this.entityDepotRepository = entityDepotRepository;
        this.utilisateurService = utilisateurService;
    }

    public List<DepotDTO> getAll() {
        List<Depot> depots = depotRepository.findAll();
        return depots.stream().map(d -> DepotDTO.builder()
                .id(d.getId())
                .depotName(d.getDepotName())
                .build())
            .collect(Collectors.toList());
    }

    public List<DepotDTO> getAllForCurrentUser() throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalArgumentException("Utilisateur non authentifié");
        }

        String email = auth.getName();
        var utilisateur = utilisateurService.findByEmail(email);
        Integer entityId = utilisateur.getEntity().getId();

        List<EntityDepot> entityDepots = entityDepotRepository.findByEntityId(entityId);

        return entityDepots.stream()
                .map(ed -> ed.getDepot())
                .distinct()
                .map(d -> DepotDTO.builder().id(d.getId()).depotName(d.getDepotName()).build())
                .collect(Collectors.toList());
    }
}
