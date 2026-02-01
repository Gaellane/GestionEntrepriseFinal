
package com.app.gestion.dto.achat;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProformaAchatDTO{
    private String refe;
    private String lienFichier;
    private Double montantTotal;
    private FournisseurDTO fournisseur;
    private LocalDateTime dateEntree;
    private List<ProformaAchatLigneDTO> lignes;

    public static ProformaAchatDTO mapToDTO(com.app.gestion.model.ProformaAchat proformaAchat) {
        if (proformaAchat == null) {
            return null;
        }
        ProformaAchatDTO dto = new ProformaAchatDTO();
        dto.setRefe(proformaAchat.getRefe());
        dto.setLienFichier(proformaAchat.getLienFichier());
        dto.setMontantTotal(proformaAchat.getMontantTotal());
        dto.setFournisseur(FournisseurDTO.mapToDTO(proformaAchat.getFournisseur()));
        dto.setDateEntree(proformaAchat.getDateEntree());
        if (proformaAchat.getProformaAchatLignes() != null) {
            List<ProformaAchatLigneDTO> ligneDTOs = proformaAchat.getProformaAchatLignes().stream()
                    .map(ProformaAchatLigneDTO::mapToDTO)
                    .toList();
            dto.setLignes(ligneDTOs);
        }
        return dto;
    }

}