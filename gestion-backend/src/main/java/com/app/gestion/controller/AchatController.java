package com.app.gestion.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.gestion.dto.achat.AchatCreateDTO;
import com.app.gestion.model.Achat;
import com.app.gestion.model.AchatLigne;
import com.app.gestion.service.AchatService;


@RestController
@RequestMapping("/api/achats")
public class AchatController {
    
    @Autowired
    private AchatService achatService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','ADMIN')")
    public ResponseEntity<Achat> createAchat(@RequestBody AchatCreateDTO achatDTO) {
        System.out.println("Creating achat with data: " + achatDTO.toString());

        Achat createdAchat = achatService.createAchat(achatDTO);
        return ResponseEntity.ok(createdAchat);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','ADMIN')")
    public ResponseEntity<?> getAllAchats() {
        return ResponseEntity.ok(achatService.getAllAchat());
    }

}
