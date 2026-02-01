package com.app.gestion.dto.proformavente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProformaVenteWorkflowDto {
    private Integer proformaId;
    private String action; // ENVOYER, ACCEPTER, REFUSER, TRANSFORMER
    private String motif; // Raison du refus ou de la validation exceptionnelle
    private Integer nouveauProcessId;
}
