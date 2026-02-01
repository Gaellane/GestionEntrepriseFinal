package com.app.gestion.dto.achat;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LivraisonAchatLigneCreateDTO {
    private Integer articleId;
    private Double quantite;
}
