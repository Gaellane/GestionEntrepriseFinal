package com.app.gestion.dto.stock;

import java.time.LocalDateTime;

import com.app.gestion.model.Inventaire;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventaireDTO {
    private Integer id;
    private Integer depotId;
    private LocalDateTime dateEntree;
    private String details;
    private Integer utilisateurId;
    private String utilisateurName;
    private Boolean validated;

    public static InventaireDTO fromEntity(Inventaire inv, Boolean validated) {
        if (inv == null) return null;
        Integer depotId = null;
        if (inv.getDepot() != null) depotId = inv.getDepot().getId();
        Integer utilisateurId = null;
        String utilisateurName = null;
        if (inv.getUtilisateur() != null) {
            utilisateurId = inv.getUtilisateur().getId();
            // try multiple name fields
            utilisateurName = inv.getUtilisateur().getNom();
            if (utilisateurName == null) utilisateurName = inv.getUtilisateur().getNom();
        }
        return InventaireDTO.builder()
                .id(inv.getId())
                .depotId(depotId)
                .dateEntree(inv.getDateEntree())
                .details(inv.getDetails())
                .utilisateurId(utilisateurId)
                .utilisateurName(utilisateurName)
                .validated(validated)
                .build();
    }
}
