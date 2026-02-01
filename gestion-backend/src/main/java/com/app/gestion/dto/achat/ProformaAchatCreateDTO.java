package com.app.gestion.dto.achat;

import lombok.*;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProformaAchatCreateDTO {
    private String refe;
    private Integer achatId;
    private Integer fournisseurId;
    private String lienFichier;
    private List<ProformaAchatLigneCreateDTO> lignes;

    public String toString(){
        StringBuilder sb = new StringBuilder();
        sb.append("Refe:").append(refe)
          .append(";AchatID:").append(achatId)
          .append(";FournisseurID:").append(fournisseurId)
          .append(";LienFichier:").append(lienFichier)
          .append(";Lignes:[");
        for (ProformaAchatLigneCreateDTO ligne : lignes) {
            sb.append("{").append(ligne.toString()).append("},");
        }
        if (!lignes.isEmpty()) {
            sb.setLength(sb.length() - 1); // Remove last comma
        }
        sb.append("]");
        return sb.toString();
    }

}
