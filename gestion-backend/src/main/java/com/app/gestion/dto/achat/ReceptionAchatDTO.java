package com.app.gestion.dto.achat;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceptionAchatDTO {
    private Integer id;
    private String refe;
    private String dateEntree;
    private Integer bonCommandeId;
    private String bonCommandeRefe;
    private List<ReceptionAchatLigneDTO> receptionAchatLignes;

    public static ReceptionAchatDTO mapToDTO(com.app.gestion.model.ReceptionAchat entity) {
        ReceptionAchatDTO dto = new ReceptionAchatDTO();
        dto.setId(entity.getId());
        dto.setRefe(entity.getRefe());
        dto.setDateEntree(entity.getDateEntree().toString());
        dto.setBonCommandeId(entity.getBonCommande().getId());
        dto.setBonCommandeRefe(entity.getBonCommande().getRefe());
        
        if (entity.getReceptionAchatLignes() != null) {
            List<ReceptionAchatLigneDTO> ligneDTOs = entity.getReceptionAchatLignes().stream()
                    .map(ReceptionAchatLigneDTO::mapToDTO)
                    .toList();
            dto.setReceptionAchatLignes(ligneDTOs);
        }
        
        return dto;
    }
}
