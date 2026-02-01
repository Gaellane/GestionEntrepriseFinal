package com.app.gestion.dto.achat;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class AchatCPL {
    private Integer id;
    private String refe;
    private String demandeur;
    private AchatProcessDTO process;
    private LocalDate dateEffective;
    private AchatProcessDTO achatProcess;
    private List<AchatLigneDTO> achatLignes;
    private List<Integer> fournisseurIds;

    public static AchatCPL mapToDTO(com.app.gestion.model.Achat achat) {
        AchatCPL dto = new AchatCPL();
        dto.setId(achat.getId());
        dto.setRefe(achat.getRefe());
        dto.setDemandeur(achat.getDemandeur().getNom());
        dto.setProcess(AchatProcessDTO.mapToDTO(achat.getProcess()));
        dto.setDateEffective(achat.getDateEffective());
        dto.setAchatProcess(AchatProcessDTO.mapToDTO(achat.getProcess()));
        if (achat.getAchatLignes() == null) {
            dto.setAchatLignes(List.of());
            return dto;
        } else {
            List<AchatLigneDTO> ligneDTOs = achat.getAchatLignes().stream()
            .map(AchatLigneDTO::mapToDTO)
            .collect(Collectors.toList());
            dto.setAchatLignes(ligneDTOs);
        }
        List<Integer> fournisseurIds = achat.getCommandes().stream()
                .map(commande -> commande.getFournisseur().getId())
                .distinct()
                .collect(Collectors.toList());
        dto.setFournisseurIds(fournisseurIds);
        return dto;
    }
}
