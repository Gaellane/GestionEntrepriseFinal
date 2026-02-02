package com.app.gestion.dto.stock;

import com.app.gestion.model.LotMouvement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LotMouvementDTO {
    private Integer id;
    private String lotNumero;
    private Integer lotId;
    private String articleNom;
    private Integer articleId;
    private String depotNom;
    private Integer depotId;
    private Double quantite;
    private String typeMouvement;
    private Integer typeMouvementId;
    private String raison;
    private Integer raisonId;
    private LocalDateTime dateEntree;
    private String description;
    private Double prixUnitaire;

    public static LotMouvementDTO mapToDTO(LotMouvement mouvement) {
        return LotMouvementDTO.builder()
                .id(mouvement.getId())
                .lotNumero(mouvement.getLot() != null ? mouvement.getLot().getNumero() : null)
                .lotId(mouvement.getLot() != null ? mouvement.getLot().getId() : null)
                .articleNom(mouvement.getLot() != null && mouvement.getLot().getArticle() != null
                        ? mouvement.getLot().getArticle().getArticleNom()
                        : null)
                .articleId(mouvement.getLot() != null && mouvement.getLot().getArticle() != null
                        ? mouvement.getLot().getArticle().getId()
                        : null)
                .depotNom(mouvement.getLot() != null && mouvement.getLot().getDepot() != null
                        ? mouvement.getLot().getDepot().getDepotName()
                        : null)
                .depotId(mouvement.getLot() != null && mouvement.getLot().getDepot() != null
                        ? mouvement.getLot().getDepot().getId()
                        : null)
                .quantite(mouvement.getQuantite())
                .typeMouvement(mouvement.getTypeMouvement() != null
                        ? mouvement.getTypeMouvement().getTypeName()
                        : null)
                .typeMouvementId(mouvement.getTypeMouvement() != null
                        ? mouvement.getTypeMouvement().getId()
                        : null)
                .raison(mouvement.getRaison() != null ? mouvement.getRaison().getRaisonName() : null)
                .raisonId(mouvement.getRaison() != null ? mouvement.getRaison().getId() : null)
                .dateEntree(mouvement.getDateEntree())
                .description(mouvement.getDescription())
                .prixUnitaire(mouvement.getLot() != null ? mouvement.getLot().getPrixUnitaire() : null)
                .build();
    }
}
