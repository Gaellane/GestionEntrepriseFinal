package com.app.gestion.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.gestion.dto.achat.ProformaAchatDTO;
import com.app.gestion.dto.achat.ProformaAchatCreateDTO;
import com.app.gestion.dto.achat.CommandeCreateDTO;
import com.app.gestion.dto.achat.CommandeDTO;
import com.app.gestion.dto.achat.AchatCreateDTO;
import com.app.gestion.dto.achat.AchatDTO;
import com.app.gestion.dto.achat.AchatCPL;
import com.app.gestion.model.Achat;
import com.app.gestion.model.BonCommandeAchat;
import com.app.gestion.model.LivraisonAchat;
import com.app.gestion.model.ReceptionAchat;
import com.app.gestion.service.AchatService;
import com.app.gestion.service.PdfService;
import com.app.gestion.dto.achat.BonCommandeAchatDTO;
import com.app.gestion.dto.achat.LivraisonAchatCreateDTO;
import com.app.gestion.dto.achat.LivraisonAchatDTO;
import com.app.gestion.dto.achat.ReceptionAchatCreateDTO;
import com.app.gestion.dto.achat.ReceptionAchatDTO;
import com.app.gestion.repository.BonCommandeAchatRepository;
import com.app.gestion.repository.LivraisonAchatRepository;
import com.app.gestion.repository.ReceptionAchatRepository;

import java.util.List;


@RestController
@RequestMapping("/api/achats")
public class AchatController {
    
    @Autowired
    private AchatService achatService;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private BonCommandeAchatRepository bonCommandeAchatRepository;

    @Autowired
    private LivraisonAchatRepository livraisonAchatRepository;

    @Autowired
    private ReceptionAchatRepository receptionAchatRepository;

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

    @PostMapping("/commande/{id}/demande")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','ADMIN')")
    private ResponseEntity<?> demandeProforma(@PathVariable Integer id , @RequestBody List<CommandeCreateDTO> commandeCreateDTOs) {
        try {
            achatService.demandeProforma(id, commandeCreateDTOs);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/commande/{id}/list")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','ADMIN')")
    public ResponseEntity<?> getCommandesByAchatId(@PathVariable Integer id) {
        try {
            List<CommandeDTO> commandes = achatService.getCommandesByAchatId(id);
            return ResponseEntity.ok(commandes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/proforma/{achatId}/fournisseur/{fournisseurId}")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','ADMIN')")
    public ResponseEntity<?> getProformaByAchatAndFournisseur(@PathVariable Integer achatId, @PathVariable Integer fournisseurId) {
        try {

            ProformaAchatDTO proforma = achatService.getProformaByAchatIdAndFournisseurId(achatId, fournisseurId);
            return ResponseEntity.ok(proforma);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/proforma/create")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','ADMIN')")
    public ResponseEntity<?> createProforma(@RequestBody ProformaAchatCreateDTO proformaCreateDTO) {
        try {
            ProformaAchatCreateDTO createdProforma = achatService.createProforma(proformaCreateDTO);
            return ResponseEntity.ok(createdProforma);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/commande/{id}/create")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','ADMIN')")
    public ResponseEntity<?> createCommande(@PathVariable Integer id) {
        try {
            BonCommandeAchatDTO commande = achatService.createCommandeAchat(id);
            System.out.println("Created commande: " + commande.getId());
            return ResponseEntity.ok(commande);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/commande/{id}/get")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','ADMIN')")
    public ResponseEntity<?> getCommandeByAchatId(@PathVariable Integer id) {
        try {
            BonCommandeAchatDTO commande = achatService.getCommandeAchatByAchatId(id);
            return ResponseEntity.ok(commande);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/livraison/create")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','RESP_MAGASIN','ADMIN')")
    public ResponseEntity<?> createLivraison(@RequestBody LivraisonAchatCreateDTO livraisonDTO) {
        try {
            LivraisonAchatDTO livraison = achatService.createLivraisonAchat(livraisonDTO);
            return ResponseEntity.ok(livraison);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur lors de la création de la livraison: " + e.getMessage());
        }
    }

    @GetMapping("/livraison/{achatId}/get")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','RESP_MAGASIN','ADMIN')")
    public ResponseEntity<?> getLivraisonByAchatId(@PathVariable Integer achatId) {
        try {
            LivraisonAchatDTO livraison = achatService.getLivraisonByAchatId(achatId);
            return ResponseEntity.ok(livraison);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/reception/create")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','RESP_MAGASIN','ADMIN')")
    public ResponseEntity<?> createReception(@RequestBody ReceptionAchatCreateDTO receptionDTO) {
        try {
            ReceptionAchatDTO reception = achatService.createReceptionAchat(receptionDTO);
            return ResponseEntity.ok(reception);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur lors de la création de la réception: " + e.getMessage());
        }
    }

    @GetMapping("/reception/{achatId}/get")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','RESP_MAGASIN','ADMIN')")
    public ResponseEntity<?> getReceptionByAchatId(@PathVariable Integer achatId) {
        try {
            ReceptionAchatDTO reception = achatService.getReceptionByAchatId(achatId);
            return ResponseEntity.ok(reception);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/cloturer/{achatId}")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','RESP_MAGASIN','ADMIN')")
    public ResponseEntity<?> cloturerAchat(@PathVariable Integer achatId) {
        try {
            achatService.cloturerAchat(achatId);
            return ResponseEntity.ok().body("Achat clôturé avec succès");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur lors de la clôture de l'achat: " + e.getMessage());
        }
    }

    @GetMapping("/commande/{bonCommandeId}/pdf")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','RESP_MAGASIN','ADMIN')")
    public ResponseEntity<byte[]> downloadBonCommandePdf(@PathVariable Integer bonCommandeId) {
        try {
            BonCommandeAchat bonCommande = bonCommandeAchatRepository.findById(bonCommandeId)
                    .orElseThrow(() -> new Exception("Bon de commande non trouvé"));
            
            byte[] pdfBytes = pdfService.generateBonCommandePdf(bonCommande);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "bon_commande_" + bonCommande.getRefe() + ".pdf");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/livraison/{livraisonId}/pdf")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','RESP_MAGASIN','ADMIN')")
    public ResponseEntity<byte[]> downloadLivraisonPdf(@PathVariable Integer livraisonId) {
        try {
            LivraisonAchat livraison = livraisonAchatRepository.findById(livraisonId)
                    .orElseThrow(() -> new Exception("Livraison non trouvée"));
            
            byte[] pdfBytes = pdfService.generateLivraisonPdf(livraison);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "bon_livraison_" + livraison.getRefe() + ".pdf");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/reception/{receptionId}/pdf")
    @PreAuthorize("hasAnyAuthority('RESP_ACHAT','RESP_MAGASIN','ADMIN')")
    public ResponseEntity<byte[]> downloadReceptionPdf(@PathVariable Integer receptionId) {
        try {
            ReceptionAchat reception = receptionAchatRepository.findById(receptionId)
                    .orElseThrow(() -> new Exception("Réception non trouvée"));
            
            byte[] pdfBytes = pdfService.generateReceptionPdf(reception);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "bon_reception_" + reception.getRefe() + ".pdf");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

}
