package com.app.gestion.dto.achat;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BonCommandeAchatDTO {
    private Integer id;
    private Integer proformaId;
    private String proformaRefe;
    private String fournisseurNom;
    private String dateEntree;
    private Double montantTotal;
    private Integer processId;
    private String refe;
    private List<BonCommandeAchatLigneDTO> bonCommandeAchatLignes;

    public static BonCommandeAchatDTO mapToDTO(com.app.gestion.model.BonCommandeAchat entity) {
        BonCommandeAchatDTO dto = new BonCommandeAchatDTO();
        dto.setId(entity.getId());
        dto.setProformaId(entity.getProforma().getId());
        dto.setFournisseurNom(entity.getProforma().getFournisseur().getFournisseurNom());
        dto.setProformaRefe(entity.getProforma().getRefe());
        dto.setDateEntree(entity.getDateEntree().toString());
        dto.setMontantTotal(entity.getMontantTotal());
        dto.setProcessId(entity.getProcess().getId());
        dto.setRefe(entity.getRefe());
        List<BonCommandeAchatLigneDTO> ligneDTOs = entity.getBonCommandeAchatLignes().stream()
                .map(BonCommandeAchatLigneDTO::mapToDTO)
                .toList();
        dto.setBonCommandeAchatLignes(ligneDTOs);
        return dto;
    }

}

