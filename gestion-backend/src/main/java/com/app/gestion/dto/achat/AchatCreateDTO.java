package com.app.gestion.dto.achat;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class AchatCreateDTO {
    private LocalDate dateEffective;
    private List<AchatLigneDTO> lignes;

    public String toString() {
        String va = "AchatCreateDTO{" +
                "dateEffective=" + dateEffective +
                ", lignes=" ;
        for (AchatLigneDTO ligne : lignes) {
            va += ligne.toString() + "; ";
        }
        va += "}";
        return va;
                
    }
}

