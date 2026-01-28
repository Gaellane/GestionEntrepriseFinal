package com.app.gestion.dto.achat;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FournisseurDTO {
    private Integer id;
    private String fournisseurNom;
    private String contact;
    private String adresse;
    private String coordonneeBancaire;

    public static FournisseurDTO mapToDTO(com.app.gestion.model.Fournisseur fournisseur) {
        FournisseurDTO dto = new FournisseurDTO();
        dto.setId(fournisseur.getId());
        dto.setFournisseurNom(fournisseur.getFournisseurNom());
        dto.setContact(fournisseur.getContact());
        dto.setAdresse(fournisseur.getAdresse());
        dto.setCoordonneeBancaire(fournisseur.getCoordonneeBancaire());
        return dto;
    }

}
