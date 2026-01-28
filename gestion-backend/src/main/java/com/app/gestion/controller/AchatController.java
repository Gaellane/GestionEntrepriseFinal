package com.app.gestion.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.gestion.dto.achat.AchatCreateDTO;
import com.app.gestion.dto.achat.AchatDTO;
import com.app.gestion.dto.achat.AchatCPL;
import com.app.gestion.model.Achat;
import com.app.gestion.service.AchatService;


@RestController
@RequestMapping("/api/achats")
public class AchatController {
    
    @Autowired
    private AchatService achatService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','ADMIN')")
    public ResponseEntity<?> createAchat(@RequestBody AchatCreateDTO achatDTO) {
        System.out.println("Creating achat with data: " + achatDTO.toString());

        Achat createdAchat = achatService.createAchat(achatDTO);
        AchatDTO retour = new AchatDTO();
        retour.setId(createdAchat.getId());
        retour.setRefe(createdAchat.getRefe());
        return ResponseEntity.ok(retour);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','RESP_MAGASIN','RESP_FINANCE','ADMIN')")
    public ResponseEntity<?> getAllAchats() {
        return ResponseEntity.ok(achatService.getAllAchat());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','RESP_MAGASIN','RESP_FINANCE','ADMIN')")
    public ResponseEntity<?> getAchatById(@PathVariable Integer id) {
        try {
            AchatCPL achatCPL = achatService.getAchatById(id);
            return ResponseEntity.ok(achatCPL);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }



    @GetMapping("/valider/{id}/magasinier")
    @PreAuthorize("hasAnyAuthority('RESP_MAGASIN','ADMIN')")
    public ResponseEntity<?> validerAchatMagasinier(@PathVariable Integer id) {
        try {
            Achat achat = (achatService.validerMagasinier(id));
            AchatDTO achatDTO = new AchatDTO();
            achatDTO.setId(achat.getId());
            achatDTO.setRefe(achat.getRefe());
            achatDTO.setDemandeur(achat.getDemandeur().getNom());
            achatDTO.setProcess(achat.getProcess().getProcessName());
            return ResponseEntity.ok(achatDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/valider/{id}/financier")
    @PreAuthorize("hasAnyAuthority('RESP_FINANCE','ADMIN')")
    public ResponseEntity<?> validerAchatFinancier(@PathVariable Integer id) {
        try {
            Achat achat = (achatService.validerFinancier(id));
            AchatDTO achatDTO = new AchatDTO();
            achatDTO.setId(achat.getId());
            achatDTO.setRefe(achat.getRefe());
            achatDTO.setDemandeur(achat.getDemandeur().getNom());
            achatDTO.setProcess(achat.getProcess().getProcessName());
            return ResponseEntity.ok(achatDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
    

}
