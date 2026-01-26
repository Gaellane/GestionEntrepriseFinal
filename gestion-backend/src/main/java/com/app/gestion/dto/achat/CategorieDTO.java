package com.app.gestion.dto.achat;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorieDTO {
    private Integer id;
    private String categorieName;
    private String description;
    private Integer dluo;
    private Integer dlc;

    public static CategorieDTO mapToDTO(com.app.gestion.model.Categorie cat) {
        if (cat == null) return null;
        return new CategorieDTO(
                cat.getId(),
                cat.getCategorieName(),
                cat.getDescription(),
                cat.getDluo(),
                cat.getDlc()
        );
    }

}
