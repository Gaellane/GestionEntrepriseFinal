package com.app.gestion.service;

import com.app.gestion.dto.stock.RaisonMouvementDTO;
import com.app.gestion.model.RaisonMouvement;
import com.app.gestion.repository.RaisonMouvementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RaisonMouvementService {

    @Autowired
    private RaisonMouvementRepository raisonMouvementRepository;

    public List<RaisonMouvementDTO> getAllRaisons() {
        return raisonMouvementRepository.findAllByOrderByRaisonNameAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RaisonMouvementDTO> getRaisonsForMovement(Integer movementType) {
        String category = "ENTREE";
        if (movementType != null && movementType == 2) {
            category = "SORTIE";
        }

        return raisonMouvementRepository.findByDescriptionOrderByRaisonNameAsc(category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private RaisonMouvementDTO convertToDTO(RaisonMouvement raison) {
        return RaisonMouvementDTO.builder()
                .id(raison.getId())
                .raisonName(raison.getRaisonName())
                .description(raison.getDescription())
                .build();
    }
}