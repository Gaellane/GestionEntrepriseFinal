package com.app.gestion.dto.achat;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceptionAchatCreateDTO {
    private Integer livraisonId;
    private List<ReceptionAchatLigneCreateDTO> lignes;
}
