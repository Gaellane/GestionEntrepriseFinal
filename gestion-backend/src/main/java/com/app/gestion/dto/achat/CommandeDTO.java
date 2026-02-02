package com.app.gestion.dto.achat;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommandeDTO {
    private Integer id;
    private Integer achatId;
    private FournisseurDTO fournisseur;
    private String dateCommande;

    public static CommandeDTO mapToDTO(com.app.gestion.model.Commande commande) {
        CommandeDTO dto = new CommandeDTO();
        dto.setId(commande.getId());
        dto.setAchatId(commande.getAchat().getId());
        dto.setFournisseur(FournisseurDTO.mapToDTO(commande.getFournisseur()));
        dto.setDateCommande(commande.getDateCommande().toString());
        return dto;
    }

}