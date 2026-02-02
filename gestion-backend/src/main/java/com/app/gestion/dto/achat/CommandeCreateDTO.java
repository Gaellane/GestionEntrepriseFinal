package com.app.gestion.dto.achat;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommandeCreateDTO {
    private Integer achatId;
    private Integer fournisseurId;

    public String toString() {
        return "AchatId: " + achatId + ", FournisseurId: " + fournisseurId;
    }
}
