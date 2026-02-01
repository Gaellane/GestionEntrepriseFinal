package com.app.gestion.dto.achat;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LivraisonAchatCreateDTO {
    private Integer bonCommandeId;
    private String refe;
    private List<LivraisonAchatLigneCreateDTO> lignes;
}
