package com.app.gestion.dto.achat;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LivraisonAchatDTO {
    private Integer id;
    private String refe;
    private String dateEntree;
    private Integer bonCommandeId;
    private String bonCommandeRefe;
    private List<LivraisonAchatLigneDTO> livraisonAchatLignes;

    public static LivraisonAchatDTO mapToDTO(com.app.gestion.model.LivraisonAchat entity) {
        LivraisonAchatDTO dto = new LivraisonAchatDTO();
        dto.setId(entity.getId());
        dto.setRefe(entity.getRefe());
        dto.setDateEntree(entity.getDateEntree().toString());
        dto.setBonCommandeId(entity.getBonCommande().getId());
        dto.setBonCommandeRefe(entity.getBonCommande().getRefe());
        
        if (entity.getLivraisonAchatLignes() != null) {
            List<LivraisonAchatLigneDTO> ligneDTOs = entity.getLivraisonAchatLignes().stream()
                    .map(LivraisonAchatLigneDTO::mapToDTO)
                    .toList();
            dto.setLivraisonAchatLignes(ligneDTOs);
        }
        
        return dto;
    }
}
