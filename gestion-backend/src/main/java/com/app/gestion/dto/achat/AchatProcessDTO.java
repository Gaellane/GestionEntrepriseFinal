package com.app.gestion.dto.achat;

import lombok.Data;

@Data
public class AchatProcessDTO {
    private Integer id;
    private String processName;
    private String abreviation;
    private Integer valeur;

    public static AchatProcessDTO mapToDTO(com.app.gestion.model.AchatProcess process) {
        AchatProcessDTO dto = new AchatProcessDTO();
        dto.setId(process.getId());
        dto.setProcessName(process.getProcessName());
        dto.setAbreviation(process.getAbreviation());
        dto.setValeur(process.getValeur());
        return dto;
    }

}
