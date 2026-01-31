package com.app.gestion.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.gestion.model.Fournisseur;
import com.app.gestion.repository.FournisseurRepository;
import com.app.gestion.dto.achat.FournisseurDTO;

import java.util.List;

@Service
@Transactional
public class FournisseurService {
    
    @Autowired
    private FournisseurRepository fournisseurRepository;

    public FournisseurDTO getFournisseurById(Integer id) {
        Fournisseur fournisseur = fournisseurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fournisseur not found with id " + id));
        return FournisseurDTO.mapToDTO(fournisseur);
    }

    public List<FournisseurDTO> getAllFournisseurs() {
        List<Fournisseur> fournisseurs = fournisseurRepository.findAll();
        return fournisseurs.stream()
                .map(FournisseurDTO::mapToDTO)
                .toList();
    }

    public FournisseurDTO createFournisseur(FournisseurDTO fournisseurDTO) {
        Fournisseur fournisseur = new Fournisseur();
        fournisseur.setFournisseurNom(fournisseurDTO.getFournisseurNom());
        fournisseur.setContact(fournisseurDTO.getContact());
        fournisseur.setAdresse(fournisseurDTO.getAdresse());
        fournisseur.setCoordonneeBancaire(fournisseurDTO.getCoordonneeBancaire());

        Fournisseur savedFournisseur = fournisseurRepository.save(fournisseur);
        return FournisseurDTO.mapToDTO(savedFournisseur);
    }

}
