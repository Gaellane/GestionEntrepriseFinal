package com.app.gestion.dto.achat;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceptionAchatLigneCreateDTO {
    private Integer articleId;
    private Integer depotId;
    private Double quantite;
}
