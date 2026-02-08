package com.app.gestion.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.gestion.ai.tool.AiTool;
import com.app.gestion.model.Fournisseur;
import com.app.gestion.repository.FournisseurRepository;
import com.app.gestion.dto.achat.FournisseurDTO;

import java.util.List;

@Service
@Transactional
public class FournisseurService {
    
    @Autowired
    private FournisseurRepository fournisseurRepository;

    @AiTool(
        name = "recuperer_fournisseur_par_id",
        description = "Récupère les informations détaillées d'un fournisseur spécifique à partir de son identifiant unique (ID). Retourne le nom du fournisseur, ses coordonnées de contact, son adresse et ses informations bancaires.",
        domain = "achat",
        readOnly = true
    )
    public FournisseurDTO getFournisseurById(Integer id) {
        Fournisseur fournisseur = fournisseurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fournisseur not found with id " + id));
        return FournisseurDTO.mapToDTO(fournisseur);
    }

    @AiTool(
        name = "recuperer_tous_fournisseurs",
        description = "Récupère la liste complète de tous les fournisseurs enregistrés dans le système avec leurs informations détaillées (nom, contact, adresse, coordonnées bancaires). Utile pour obtenir une vue d'ensemble de tous les partenaires d'approvisionnement.",
        domain = "achat",
        readOnly = true
    )
    public List<FournisseurDTO> getAllFournisseurs() {
        List<Fournisseur> fournisseurs = fournisseurRepository.findAll();
        return fournisseurs.stream()
                .map(FournisseurDTO::mapToDTO)
                .toList();
    }

    @AiTool(
        name = "creer_fournisseur",
        description = "Crée un nouveau fournisseur dans le système avec son nom, ses informations de contact, son adresse physique et ses coordonnées bancaires. Permet d'enregistrer un nouveau partenaire d'approvisionnement pour les achats.",
        domain = "achat",
        readOnly = false,
        dangerous = false
    )
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
