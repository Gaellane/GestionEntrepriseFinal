package com.app.gestion.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.app.gestion.ai.tool.AiTool;
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

    @AiTool(
        name = "recuperer_tous_depots",
        description = "Récupère la liste complète de tous les dépôts/entrepôts enregistrés dans le système avec leurs identifiants et noms. Permet d'obtenir une vue d'ensemble de tous les emplacements de stockage disponibles dans l'organisation.",
        domain = "stock",
        readOnly = true
    )
    public List<DepotDTO> getAll() {
        List<Depot> depots = depotRepository.findAll();
        return depots.stream().map(d -> DepotDTO.builder()
                .id(d.getId())
                .depotName(d.getDepotName())
                .build())
            .collect(Collectors.toList());
    }

    @AiTool(
        name = "recuperer_depots_utilisateur_courant",
        description = "Récupère la liste des dépôts accessibles à l'utilisateur actuellement connecté, en fonction de l'entité à laquelle il appartient. Filtre les dépôts selon les permissions et l'organisation de l'utilisateur pour respecter la sécurité et la ségrégation des données.",
        domain = "stock",
        readOnly = true
    )
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

    // Backwards-compatible overload: allow callers to request depots by movement type
    public List<DepotDTO> getAllForCurrentUser(int type) throws Exception {
        return getDepotsForMovement(type);
    }

    /**
     * Retourne les dépôts en fonction du type de mouvement :
     * type == 1 -> dépôts de l'entité de l'utilisateur (entrée)
     * type == 2 -> dépôts des autres entités (sortie)
     */
    @AiTool(
        name = "recuperer_depots_par_type_mouvement",
        description = "Récupère les dépôts en fonction du type de mouvement de stock. Type 1 retourne les dépôts de l'entité de l'utilisateur (pour les entrées de stock), Type 2 retourne les dépôts des autres entités (pour les sorties de stock). Permet de filtrer les dépôts selon le flux logistique.",
        domain = "stock",
        readOnly = true
    )
    public List<DepotDTO> getDepotsForMovement(int type) throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalArgumentException("Utilisateur non authentifié");
        }

        String email = auth.getName();
        var utilisateur = utilisateurService.findByEmail(email);
        Integer entityId = utilisateur.getEntity().getId();

        List<EntityDepot> entityDepots;
        if (type == 1) {
            // Entrée : dépôts appartenant à l'entité de l'utilisateur
            entityDepots = entityDepotRepository.findByEntityId(entityId);
        } else if (type == 2) {
            // Sortie : dépôts des autres entités (exclure l'entité courante)
            entityDepots = entityDepotRepository.findAll()
                    .stream()
                    .filter(ed -> ed.getEntity() != null && !entityId.equals(ed.getEntity().getId()))
                    .collect(Collectors.toList());
        } else {
            // Par défaut, retourner dépôts de l'utilisateur
            entityDepots = entityDepotRepository.findByEntityId(entityId);
        }

        return entityDepots.stream()
                .map(ed -> ed.getDepot())
                .distinct()
                .map(d -> DepotDTO.builder().id(d.getId()).depotName(d.getDepotName()).build())
                .collect(Collectors.toList());
    }
}
