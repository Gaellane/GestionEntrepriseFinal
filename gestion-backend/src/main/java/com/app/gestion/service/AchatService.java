package com.app.gestion.service;

import com.app.gestion.model.Achat;
import com.app.gestion.model.AchatProcess;
import com.app.gestion.model.AchatLigne;
import com.app.gestion.model.AchatHistorique;
import com.app.gestion.model.Utilisateur;
import com.app.gestion.model.AuditLog;
import com.app.gestion.model.Action;
import com.app.gestion.model.Article;
import com.app.gestion.model.Commande;
import com.app.gestion.model.Fournisseur;
import com.app.gestion.model.ProformaAchat;
import com.app.gestion.model.ProformaAchatLigne;
import com.app.gestion.model.BonCommandeAchat;
import com.app.gestion.model.BonCommandeAchatLigne;
import com.app.gestion.model.BonCommandeProcess;
import com.app.gestion.model.BonCommandeHistorique;
import com.app.gestion.model.LivraisonAchat;
import com.app.gestion.model.LivraisonAchatLigne;
import com.app.gestion.model.ReceptionAchat;
import com.app.gestion.model.ReceptionAchatLigne;
import com.app.gestion.model.Depot;

import com.app.gestion.repository.ProformaAchatLigneRepository;
import com.app.gestion.repository.ProformaAchatRepository;
import com.app.gestion.repository.AchatLigneRepository;
import com.app.gestion.repository.AchatRepository;
import com.app.gestion.repository.ArticleRepository;
import com.app.gestion.repository.AchatHistoriqueRepository;
import com.app.gestion.repository.AchatProcessRepository;
import com.app.gestion.repository.AuditLogRepository;
import com.app.gestion.repository.ActionRepository;
import com.app.gestion.repository.CommandeRepository;
import com.app.gestion.repository.FournisseurRepository;
import com.app.gestion.repository.BonCommandeAchatRepository;
import com.app.gestion.repository.BonCommandeAchatLigneRepository;
import com.app.gestion.repository.BonCommandeProcessRepository;
import com.app.gestion.repository.BonCommandeHistoriqueRepository;
import com.app.gestion.repository.LivraisonAchatRepository;
import com.app.gestion.repository.LivraisonAchatLigneRepository;
import com.app.gestion.repository.ReceptionAchatRepository;
import com.app.gestion.repository.ReceptionAchatLigneRepository;
import com.app.gestion.repository.DepotRepository;

import com.app.gestion.config.CurrentUserUtil;

import com.app.gestion.dto.achat.ProformaAchatDTO;
import com.app.gestion.dto.achat.ProformaAchatLigneCreateDTO;
import com.app.gestion.dto.achat.ProformaAchatCreateDTO;
import com.app.gestion.dto.achat.CommandeCreateDTO;
import com.app.gestion.dto.achat.CommandeDTO;
import com.app.gestion.dto.achat.AchatCreateDTO;
import com.app.gestion.dto.achat.AchatLigneDTO;
import com.app.gestion.dto.achat.AchatCPL;
import com.app.gestion.dto.achat.BonCommandeAchatDTO;
import com.app.gestion.dto.achat.BonCommandeAchatLigneDTO;
import com.app.gestion.dto.achat.LivraisonAchatCreateDTO;
import com.app.gestion.dto.achat.LivraisonAchatLigneCreateDTO;
import com.app.gestion.dto.achat.LivraisonAchatDTO;
import com.app.gestion.dto.achat.ReceptionAchatCreateDTO;
import com.app.gestion.dto.achat.ReceptionAchatLigneCreateDTO;
import com.app.gestion.dto.achat.ReceptionAchatDTO;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

import com.app.gestion.utilitaire.ReferenceGenerator;

@Service
@Transactional
public class AchatService {
    @Autowired
    private AchatRepository achatRepository;

    @Autowired
    private AchatLigneRepository achatLigneRepository;
    
    @Autowired
    private AchatProcessRepository achatProcessRepository;

    @Autowired
    private AchatHistoriqueRepository achatHistoriqueRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ActionRepository actionRepository;

    @Autowired
    private CommandeRepository commandeRepository;

    @Autowired 
    private FournisseurRepository fournisseurRepository;

    @Autowired
    private ProformaAchatRepository proformaAchatRepository;

    @Autowired
    private ProformaAchatLigneRepository proformaAchatLigneRepository;

    @Autowired
    private CurrentUserUtil currentUserUtil;

    @Autowired
    private BonCommandeAchatRepository bonCommandeAchatRepository;

    @Autowired
    private BonCommandeAchatLigneRepository bonCommandeAchatLigneRepository;

    @Autowired
    private BonCommandeProcessRepository bonCommandeProcessRepository;

    @Autowired
    private BonCommandeHistoriqueRepository bonCommandeHistoriqueRepository;
 
    @Autowired
    private LivraisonAchatRepository livraisonAchatRepository;

    @Autowired
    private LivraisonAchatLigneRepository livraisonAchatLigneRepository;

    @Autowired
    private ReceptionAchatRepository receptionAchatRepository;

    @Autowired
    private ReceptionAchatLigneRepository receptionAchatLigneRepository;

    @Autowired
    private DepotRepository depotRepository;
    @Autowired 
    private CaisseMouvementService caisseMouvementService;


    public Achat createAchat(AchatCreateDTO achatDTO) {
        LocalDateTime now = LocalDateTime.now();
        Utilisateur currentUser = currentUserUtil.getCurrentUser();
        Action createAction = actionRepository.findByActionName("CREATE").orElseThrow(() -> new RuntimeException("Action CREATE not found"));
        AchatProcess createProcess = achatProcessRepository.findByValeur(1).orElseThrow(() -> new RuntimeException("AchatProcess with valeur 1 not found"));

        Achat achat = new Achat();
        // set data Achat
        achat.setDateEntree(now);
        achat.setDateEffective(achatDTO.getDateEffective());
        achat.setDemandeur(currentUser);
        achat.setProcess(createProcess);
        achat.setRefe(ReferenceGenerator.generateReference("ACH-"));
        if (achat.getDateEffective() == null) {
            achat.setDateEffective(achat.getDateEntree().plusDays(2).toLocalDate());
        }
        List<AchatLigne> lignes = new ArrayList<>();
        for (AchatLigneDTO ligneDTO : achatDTO.getLignes()) {
            AchatLigne ligne = new AchatLigne();
            ligne.setAchat(achat);
            Article article = articleRepository.findById(ligneDTO.getArticleId())
                .orElseThrow(() -> new RuntimeException("Article not found with id " + ligneDTO.getArticleId()));
            ligne.setArticle(article);
            ligne.setQuantite(ligneDTO.getQuantite());
            ligne.setPrixUnitaire(ligneDTO.getPrixUnitaireEstime());
            ligne.setPrixUnitaireEstime(ligneDTO.getPrixUnitaireEstime());
            lignes.add(ligne);
        }

        // set data historique
        AchatHistorique historique = new AchatHistorique();
        historique.setAchat(achat);
        historique.setProcess(createProcess);
        historique.setDateEntree(now);

        // set data audit log
        AuditLog auditLog = new AuditLog();
        auditLog.setUtilisateur(currentUser);
        auditLog.setAction(createAction);
        auditLog.setActionTimestamp(now);
        auditLog.setClasses("Achat");
        auditLog.setDetails("Created achat with reference " + achat.getRefe());

        // save all
        achatRepository.save(achat);
        for (AchatLigne ligne : lignes) {
            achatLigneRepository.save(ligne);
        }
        achatHistoriqueRepository.save(historique);

        auditLog.setIdsClasses(achat.getId().toString());
        auditLog.setNewValues(achat.toString());
        auditLogRepository.save(auditLog);

        // 
        
        return achatRepository.save(achat);
    }


    public List<AchatProcess> getAllAchatProcesses() {
        return achatProcessRepository.findAll();
    }

    public List<AchatCPL> getAllAchat(){
        List<Achat> achats = achatRepository.findAllWithDemandeurAndProcess();
        List<AchatCPL> achatCPLs = new ArrayList<>();
        for (Achat achat : achats) {
            achatCPLs.add(AchatCPL.mapToDTO(achat));
        }
        return achatCPLs;
    }

    public AchatCPL getAchatById(Integer id) {
        Achat achat = achatRepository.findByIdWithDemandeurAndProcess(id)
                .orElseThrow(() -> new RuntimeException("Achat not found with id " + id));
        return AchatCPL.mapToDTO(achat);
    }

    public Achat validerMagasinier(Integer id){
        Achat achat = achatRepository.findById(id).orElseThrow(() -> new RuntimeException("Achat not found with id " + id));
        if(achat.getProcess().getValeur() != 1){
            throw new RuntimeException("Achat is not in a valid state for magasinier validation");
        }

        AchatProcess validerProcess = achatProcessRepository.findByValeur(11).orElseThrow(() -> new RuntimeException("AchatProcess with valeur 11 not found"));
        AchatHistorique historique = new AchatHistorique();

        //audit
        Action action = actionRepository.findByActionName("VALIDATE").orElseThrow(() -> new RuntimeException("Action VALIDATE_MAGASINIER not found"));
        
        LocalDateTime now = LocalDateTime.now();
        Utilisateur currentUser = currentUserUtil.getCurrentUser();
        
        // set data audit log
        AuditLog auditLog = new AuditLog();
        auditLog.setUtilisateur(currentUser);
        auditLog.setAction(action);
        auditLog.setActionTimestamp(now);
        auditLog.setClasses("Achat");
        auditLog.setDetails("Validated magasinier for achat with reference " + achat.getRefe());
        auditLog.setIdsClasses(achat.getId().toString());
        auditLog.setNewValues("Process changed to " + validerProcess.getProcessName());
        
        
        
        historique.setAchat(achat);
        historique.setProcess(validerProcess);
        historique.setDateEntree(LocalDateTime.now());
        
        achat.setProcess(validerProcess);
        
        achatHistoriqueRepository.save(historique);
        
        auditLogRepository.save(auditLog);
        

        return achatRepository.save(achat);
    }

    public Achat validerFinancier(Integer id){
        Achat achat = achatRepository.findById(id).orElseThrow(() -> new RuntimeException("Achat not found with id " + id));
        if(achat.getProcess().getValeur() != 11){
            throw new RuntimeException("Achat is not in a valid state for financier validation");
        }

        // verification de fonds 
        double totalMontant = achat.getAchatLignes().stream()
            .mapToDouble(ligne -> ligne.getQuantite() * ligne.getPrixUnitaire())
            .sum();

        if(!caisseMouvementService.estDepensePossible(totalMontant)) 
        {
            throw new RuntimeException("Fond de caisse insuffisant pour l'achat a valider");
        }   

        AchatProcess validerProcess = achatProcessRepository.findByValeur(21).orElseThrow(() -> new RuntimeException("AchatProcess with valeur 21 not found"));
        AchatHistorique historique = new AchatHistorique();
        
        //audit
        Action action = actionRepository.findByActionName("VALIDATE").orElseThrow(() -> new RuntimeException("Action VALIDATE_FINANCIER not found"));

        LocalDateTime now = LocalDateTime.now();
        Utilisateur currentUser = currentUserUtil.getCurrentUser();
        
        // set data audit log
        AuditLog auditLog = new AuditLog();
        auditLog.setUtilisateur(currentUser);
        auditLog.setAction(action);
        auditLog.setActionTimestamp(now);
        auditLog.setClasses("Achat");
        auditLog.setDetails("Validated financier for achat with reference " + achat.getRefe());
        auditLog.setIdsClasses(achat.getId().toString());
        auditLog.setNewValues("Process changed to " + validerProcess.getProcessName());
        


        historique.setAchat(achat);
        historique.setProcess(validerProcess);
        historique.setDateEntree(LocalDateTime.now());
        
        achat.setProcess(validerProcess);
        
        achatHistoriqueRepository.save(historique);

        auditLogRepository.save(auditLog);

        return achatRepository.save(achat);
    }

    public void demandeProforma(Integer achatId, List<CommandeCreateDTO> commandeCreateDTOs) throws Exception {
        String ids = "";
        String newValues = "";
        LocalDateTime now = LocalDateTime.now();
        Achat achat = achatRepository.findById(achatId)
                .orElseThrow(() -> new RuntimeException("Achat not found with id " + achatId));

        if(achat.getProcess().getValeur() < 21 ) {
            throw new RuntimeException("Achat is not in a valid state to send commandes");
        }
        if (achat.getProcess().getValeur() > 25) {
            throw new RuntimeException("Commandes have already been sent for this achat");
        }
        
        ids+= achatId.toString() + ";";

        for (CommandeCreateDTO dto : commandeCreateDTOs) {
            Commande commande = new Commande();
            commande.setAchat(achat);

            Fournisseur fournisseur = fournisseurRepository.findById(dto.getFournisseurId())
                    .orElseThrow(() -> new RuntimeException("Fournisseur not found with id " + dto.getFournisseurId()));
            commande.setFournisseur(fournisseur);

            commande.setDateCommande(now);

            commandeRepository.save(commande);
            ids+= commande.getId().toString() + ",";
            newValues += dto.toString() + ";";
        }
        if (achat.getProcess().getValeur() == 21) {
            AchatProcess nextProcess = achatProcessRepository.findByValeur(25)
                    .orElseThrow(() -> new RuntimeException("AchatProcess with valeur 25 not found"));
            achat.setProcess(nextProcess);
            
            AchatHistorique historique = new AchatHistorique();
            historique.setAchat(achat);
            historique.setProcess(nextProcess);
            historique.setDateEntree(now);

            achatHistoriqueRepository.save(historique);
            achatRepository.save(achat);
        }

        AuditLog auditLog = new AuditLog();
        Utilisateur currentUser = currentUserUtil.getCurrentUser();
        Action action = actionRepository.findByActionName("CREATE")
                .orElseThrow(() -> new RuntimeException("Action DEMANDE_PROFORMA not found"));

        auditLog.setUtilisateur(currentUser);
        auditLog.setAction(action);
        auditLog.setActionTimestamp(now);
        auditLog.setClasses("Achat;Commande");
        auditLog.setIdsClasses(ids);
        auditLog.setNewValues(newValues);
        auditLog.setDetails("Demande de proforma pour l'achat avec reference " + achat.getRefe());

        auditLogRepository.save(auditLog);
    }

    public List<CommandeDTO> getCommandesByAchatId(Integer achatId) {
        List<Commande> commandes = commandeRepository.findByAchatId(achatId);
        List<CommandeDTO> commandeDTOs = new ArrayList<>();
        for (Commande commande : commandes) {
            commandeDTOs.add(CommandeDTO.mapToDTO(commande));
        }
        return commandeDTOs;
    }

    public ProformaAchatDTO getProformaByAchatIdAndFournisseurId(Integer achatId, Integer fournisseurId) {
        ProformaAchat proformaAchat = proformaAchatRepository.findByAchatIdAndFournisseurId(achatId, fournisseurId)
                .orElseThrow(() -> new RuntimeException("ProformaAchat not found for achatId " + achatId + " and fournisseurId " + fournisseurId));
        return ProformaAchatDTO.mapToDTO(proformaAchat);
    }

    public ProformaAchatCreateDTO createProforma(ProformaAchatCreateDTO proformaAchatCreateDTO) throws Exception {
        LocalDateTime now = LocalDateTime.now();
        Double montantTotal = 0.0;
        String ids = "";

        Achat achat = achatRepository.findById(proformaAchatCreateDTO.getAchatId())
                .orElseThrow(() -> new RuntimeException("Achat not found with id " + proformaAchatCreateDTO.getAchatId()));
        
        ids+= achat.getId().toString() + ";";

        if(achat.getProcess().getValeur() < 21 ) {
            throw new RuntimeException("Achat pas encore valider");
        }
        if(achat.getProcess().getValeur() < 25  ) {
            throw new RuntimeException("Demande de proforma pas encore envoyee");
        }
        if(achat.getProcess().getValeur() > 30 ) {
            throw new RuntimeException("Commande deja en cours ou deja cloturee");
        }

        Fournisseur fournisseur = fournisseurRepository.findById(proformaAchatCreateDTO.getFournisseurId())
                .orElseThrow(() -> new RuntimeException("Fournisseur not found with id " + proformaAchatCreateDTO.getFournisseurId()));
        
        ids+= fournisseur.getId().toString() + ";";

        ProformaAchat proformaAchat = new ProformaAchat();
        proformaAchat.setAchat(achat);
        proformaAchat.setFournisseur(fournisseur);
        proformaAchat.setDateEntree(now);
        proformaAchat.setRefe(proformaAchatCreateDTO.getRefe());
        proformaAchat.setLienFichier(proformaAchatCreateDTO.getLienFichier());

        List<ProformaAchatLigneCreateDTO> ligneDTOs = proformaAchatCreateDTO.getLignes();
        if(ligneDTOs == null || ligneDTOs.isEmpty()) {
            throw new RuntimeException("ProformaAchat Vide");
        }

        List<ProformaAchatLigne> proformaAchatLignes = new ArrayList<>();


        for (ProformaAchatLigneCreateDTO ligneDTO : ligneDTOs) {
            ProformaAchatLigne ligne = new ProformaAchatLigne();
            ligne.setProforma(proformaAchat);
            Article article = articleRepository.findById(ligneDTO.getArticleId())
                    .orElseThrow(() -> new RuntimeException("Article not found with id " + ligneDTO.getArticleId()));
            ligne.setArticle(article);
            ligne.setQuantite(ligneDTO.getQuantite());
            ligne.setPrixUnitaire(ligneDTO.getPrixUnitaire());

            montantTotal += ligneDTO.getQuantite() * ligneDTO.getPrixUnitaire();
            proformaAchatLignes.add(ligne);

        }

        proformaAchat.setMontantTotal(montantTotal);
        proformaAchat.setProformaAchatLignes(proformaAchatLignes);
        // save proforma achat
        proformaAchatRepository.save(proformaAchat);
        for (ProformaAchatLigne ligne : proformaAchatLignes) {
            proformaAchatLigneRepository.save(ligne);
        }

        ids+= proformaAchat.getId().toString() + ";";

        // audit log
        AuditLog auditLog = new AuditLog();

        Action action = actionRepository.findByActionName("CREATE")
                .orElseThrow(() -> new RuntimeException("Action CREATE_PROFORMA not found"));
        Utilisateur currentUser = currentUserUtil.getCurrentUser();

        auditLog.setUtilisateur(currentUser);
        auditLog.setAction(action);
        auditLog.setActionTimestamp(now);
        auditLog.setClasses("Achat;Fournisseur;ProformaAchat");
        auditLog.setIdsClasses(ids);
        auditLog.setNewValues(proformaAchat.toString());
        auditLog.setDetails("Creation de proforma pour achat avec reference " + achat.getRefe() + " venant du fournisseur " + fournisseur.getFournisseurNom());

        auditLogRepository.save(auditLog);

        return proformaAchatCreateDTO;
    }

    public BonCommandeAchatDTO getCommandeAchatByAchatId(Integer achatId) throws Exception {
        BonCommandeAchat bonCommande = bonCommandeAchatRepository.findByAchatId(achatId)
                .orElseThrow(() -> new RuntimeException("BonCommandeAchat not found for achatId " + achatId));
        return BonCommandeAchatDTO.mapToDTO(bonCommande);
    }


    public BonCommandeAchatDTO createCommandeAchat(Integer achatId) throws Exception {
        System.out.println("\n\n\n\n\n\n\nCreating commande achat with achatId: " + achatId);
        LocalDateTime now = LocalDateTime.now();
        String ids = achatId.toString() + ";";
        Achat achat = achatRepository.findById(achatId)
                .orElseThrow(() -> new RuntimeException("Achat not found with id " + achatId));
        if(achat.getProcess().getValeur() < 25 ) {
            throw new RuntimeException("Achat is not in a valid state to create bon de commande");
        } 

        List<ProformaAchat> proformas = proformaAchatRepository.findByAchatId(achatId);
        if (proformas.isEmpty()) {
            throw new RuntimeException("No proformas found for achat with id " + achatId);
        }
        ProformaAchat bestProforma = null ;
        if(proformas.size() == 1){
            bestProforma = proformas.get(0);
        } else {
            proformas.sort((p1, p2) -> Double.compare(p1.getMontantTotal(), p2.getMontantTotal()));
            bestProforma = proformas.get(0);
        }
        ids+= bestProforma.getId().toString() + ";";
        
        List<ProformaAchatLigne> proformaLignes = proformaAchatLigneRepository.findByProformaId(bestProforma.getId());

        BonCommandeProcess process = bonCommandeProcessRepository.findByValeur(1)
                .orElseThrow(() -> new RuntimeException("BonCommandeProcess with valeur 1 not found"));

        // bon de commande
        BonCommandeAchat bonCommande = new BonCommandeAchat();
        bonCommande.setProforma(bestProforma);
        bonCommande.setDateEntree(now);
        bonCommande.setMontantTotal(bestProforma.getMontantTotal());
        bonCommande.setRefe(ReferenceGenerator.generateReference("BCA-"));
        bonCommande.setProcess(process);
        
        List<BonCommandeAchatLigne> bonCommandeLignes = new ArrayList<>();

        List<AchatLigne> achatLignes = achatLigneRepository.findByAchatId(achatId);

        for (ProformaAchatLigne proformaLigne : proformaLignes) {
            BonCommandeAchatLigne bonCommandeLigne = new BonCommandeAchatLigne();
            bonCommandeLigne.setBonCommande(bonCommande);
            bonCommandeLigne.setArticle(proformaLigne.getArticle());
            bonCommandeLigne.setQuantite(proformaLigne.getQuantite());
            bonCommandeLigne.setPrixUnitaire(proformaLigne.getPrixUnitaire());
            bonCommandeLignes.add(bonCommandeLigne);
        }

        bonCommande.setBonCommandeAchatLignes(bonCommandeLignes);

        BonCommandeHistorique historique = new BonCommandeHistorique();
        historique.setBonCommande(bonCommande);
        historique.setProcess(process);
        historique.setDateEntree(now);

        // achat
        achat.setProcess(achatProcessRepository.findByValeur(31)
                .orElseThrow(() -> new RuntimeException("AchatProcess with valeur 31 not found")));

        AchatHistorique achatHistorique = new AchatHistorique();
        achatHistorique.setAchat(achat);
        achatHistorique.setProcess(achat.getProcess());
        achatHistorique.setDateEntree(now);
        
        // audit log
        Action action = actionRepository.findByActionName("CREATE")
                .orElseThrow(() -> new RuntimeException("Action CREATE_BON_COMMANDE not found"));
        
        Utilisateur currentUser = currentUserUtil.getCurrentUser();
        AuditLog auditLog = new AuditLog();
        auditLog.setUtilisateur(currentUser);
        auditLog.setAction(action);
        auditLog.setActionTimestamp(now);
        auditLog.setClasses("Achat;ProformaAchat;");
        auditLog.setIdsClasses(ids);
        auditLog.setNewValues(bonCommande.toString());
        auditLog.setDetails("Creation de bon de commande pour achat avec reference " + achatId + " basé sur la proforma " + bestProforma.getRefe());

        bonCommandeAchatRepository.save(bonCommande);
        for (BonCommandeAchatLigne ligne : bonCommandeLignes) {
            bonCommandeAchatLigneRepository.save(ligne);
        }
        achatRepository.save(achat);
        achatHistoriqueRepository.save(achatHistorique);
        bonCommandeHistoriqueRepository.save(historique);
        auditLogRepository.save(auditLog);

        return BonCommandeAchatDTO.mapToDTO(bonCommande);

    }

    public LivraisonAchatDTO createLivraisonAchat(LivraisonAchatCreateDTO livraisonDTO) {
        LocalDateTime now = LocalDateTime.now();
        Utilisateur currentUser = currentUserUtil.getCurrentUser();

        // Récupérer le bon de commande
        BonCommandeAchat bonCommande = bonCommandeAchatRepository.findById(livraisonDTO.getBonCommandeId())
                .orElseThrow(() -> new RuntimeException("BonCommandeAchat with id " + livraisonDTO.getBonCommandeId() + " not found"));

        // Récupérer l'achat via le bon de commande -> proforma -> achat
        Achat achat = bonCommande.getProforma().getAchat();

        // Changer le process de l'achat en valeur 41
        AchatProcess newAchatProcess = achatProcessRepository.findByValeur(41)
                .orElseThrow(() -> new RuntimeException("AchatProcess with valeur 41 not found"));
        achat.setProcess(newAchatProcess);

        // Ajouter à l'historique de l'achat
        AchatHistorique achatHistorique = new AchatHistorique();
        achatHistorique.setAchat(achat);
        achatHistorique.setProcess(newAchatProcess);
        achatHistorique.setDateEntree(now);

        // Changer le process du bon de commande en valeur 41
        BonCommandeProcess newBonCommandeProcess = bonCommandeProcessRepository.findByValeur(41)
                .orElseThrow(() -> new RuntimeException("BonCommandeProcess with valeur 41 not found"));
        bonCommande.setProcess(newBonCommandeProcess);

        // Ajouter à l'historique du bon de commande
        BonCommandeHistorique bonCommandeHistorique = new BonCommandeHistorique();
        bonCommandeHistorique.setBonCommande(bonCommande);
        bonCommandeHistorique.setProcess(newBonCommandeProcess);
        bonCommandeHistorique.setDateEntree(now);

        // Créer la livraison
        LivraisonAchat livraison = new LivraisonAchat();
        livraison.setBonCommande(bonCommande);
        livraison.setRefe(livraisonDTO.getRefe());
        livraison.setDateEntree(now);

        // Créer les lignes de livraison
        List<LivraisonAchatLigne> livraisonLignes = new ArrayList<>();
        for (LivraisonAchatLigneCreateDTO ligneDTO : livraisonDTO.getLignes()) {
            Article article = articleRepository.findById(ligneDTO.getArticleId())
                    .orElseThrow(() -> new RuntimeException("Article with id " + ligneDTO.getArticleId() + " not found"));

            LivraisonAchatLigne ligne = new LivraisonAchatLigne();
            ligne.setLivraison(livraison);
            ligne.setArticle(article);
            ligne.setQuantite(ligneDTO.getQuantite());
            livraisonLignes.add(ligne);
        }

        // Ajouter dans l'audit log
        Action createAction = actionRepository.findByActionName("CREATE")
                .orElseThrow(() -> new RuntimeException("Action CREATE not found"));

        String ids = achat.getId() + ";" + bonCommande.getId() + ";" + livraison.getId() + ";";
        AuditLog auditLog = new AuditLog();
        auditLog.setUtilisateur(currentUser);
        auditLog.setAction(createAction);
        auditLog.setActionTimestamp(now);
        auditLog.setClasses("Achat;BonCommandeAchat;LivraisonAchat;");
        auditLog.setIdsClasses(ids);
        auditLog.setNewValues("Livraison créée: " + livraison.getRefe());
        auditLog.setDetails("Création de livraison pour bon de commande " + bonCommande.getRefe() + " et achat " + achat.getRefe());

        // Sauvegarder tout
        livraisonAchatRepository.save(livraison);
        for (LivraisonAchatLigne ligne : livraisonLignes) {
            livraisonAchatLigneRepository.save(ligne);
        }
        achatRepository.save(achat);
        achatHistoriqueRepository.save(achatHistorique);
        bonCommandeAchatRepository.save(bonCommande);
        bonCommandeHistoriqueRepository.save(bonCommandeHistorique);
        auditLogRepository.save(auditLog);

        return LivraisonAchatDTO.mapToDTO(livraison);
    }

    public LivraisonAchatDTO getLivraisonByAchatId(Integer achatId) {
        // Récupérer le bon de commande via l'achat
        BonCommandeAchat bonCommande = bonCommandeAchatRepository.findByProforma_Achat_Id(achatId)
                .orElseThrow(() -> new RuntimeException("BonCommandeAchat not found for achat with id " + achatId));
        
        // Récupérer la livraison via le bon de commande
        LivraisonAchat livraison = livraisonAchatRepository.findByBonCommande_Id(bonCommande.getId())
                .orElseThrow(() -> new RuntimeException("LivraisonAchat not found for bon de commande with id " + bonCommande.getId()));
        
        return LivraisonAchatDTO.mapToDTO(livraison);
    }

    public ReceptionAchatDTO createReceptionAchat(ReceptionAchatCreateDTO receptionDTO) {
        LocalDateTime now = LocalDateTime.now();
        Utilisateur currentUser = currentUserUtil.getCurrentUser();

        // Récupérer la livraison
        LivraisonAchat livraison = livraisonAchatRepository.findById(receptionDTO.getLivraisonId())
                .orElseThrow(() -> new RuntimeException("LivraisonAchat with id " + receptionDTO.getLivraisonId() + " not found"));

        BonCommandeAchat bonCommande = livraison.getBonCommande();
        Achat achat = bonCommande.getProforma().getAchat();

        // Changer le process de l'achat en valeur 45
        AchatProcess newAchatProcess = achatProcessRepository.findByValeur(45)
                .orElseThrow(() -> new RuntimeException("AchatProcess with valeur 45 not found"));
        achat.setProcess(newAchatProcess);

        // Ajouter à l'historique de l'achat
        AchatHistorique achatHistorique = new AchatHistorique();
        achatHistorique.setAchat(achat);
        achatHistorique.setProcess(newAchatProcess);
        achatHistorique.setDateEntree(now);

        // Changer le process du bon de commande en valeur 45
        BonCommandeProcess newBonCommandeProcess = bonCommandeProcessRepository.findByValeur(45)
                .orElseThrow(() -> new RuntimeException("BonCommandeProcess with valeur 45 not found"));
        bonCommande.setProcess(newBonCommandeProcess);

        // Ajouter à l'historique du bon de commande
        BonCommandeHistorique bonCommandeHistorique = new BonCommandeHistorique();
        bonCommandeHistorique.setBonCommande(bonCommande);
        bonCommandeHistorique.setProcess(newBonCommandeProcess);
        bonCommandeHistorique.setDateEntree(now);

        // Créer la réception avec référence générée
        ReceptionAchat reception = new ReceptionAchat();
        reception.setBonCommande(bonCommande);
        reception.setRefe(ReferenceGenerator.generateReference("REC-"));
        reception.setDateEntree(now);

        // Créer les lignes de réception
        List<ReceptionAchatLigne> receptionLignes = new ArrayList<>();
        for (ReceptionAchatLigneCreateDTO ligneDTO : receptionDTO.getLignes()) {
            Article article = articleRepository.findById(ligneDTO.getArticleId())
                    .orElseThrow(() -> new RuntimeException("Article with id " + ligneDTO.getArticleId() + " not found"));
            
            Depot depot = depotRepository.findById(ligneDTO.getDepotId())
                    .orElseThrow(() -> new RuntimeException("Depot with id " + ligneDTO.getDepotId() + " not found"));

            ReceptionAchatLigne ligne = new ReceptionAchatLigne();
            ligne.setReception(reception);
            ligne.setArticle(article);
            ligne.setDepot(depot);
            ligne.setQuantite(ligneDTO.getQuantite());
            receptionLignes.add(ligne);
        }

        // Ajouter dans l'audit log
        Action createAction = actionRepository.findByActionName("CREATE")
                .orElseThrow(() -> new RuntimeException("Action CREATE not found"));

        String ids = achat.getId() + ";" + bonCommande.getId() + ";" + reception.getId() + ";";
        AuditLog auditLog = new AuditLog();
        auditLog.setUtilisateur(currentUser);
        auditLog.setAction(createAction);
        auditLog.setActionTimestamp(now);
        auditLog.setClasses("Achat;BonCommandeAchat;ReceptionAchat;");
        auditLog.setIdsClasses(ids);
        auditLog.setNewValues("Réception créée: " + reception.getRefe());
        auditLog.setDetails("Création de réception pour bon de commande " + bonCommande.getRefe() + " et achat " + achat.getRefe());

        // Sauvegarder tout
        receptionAchatRepository.save(reception);
        for (ReceptionAchatLigne ligne : receptionLignes) {
            receptionAchatLigneRepository.save(ligne);
        }
        achatRepository.save(achat);
        achatHistoriqueRepository.save(achatHistorique);
        bonCommandeAchatRepository.save(bonCommande);
        bonCommandeHistoriqueRepository.save(bonCommandeHistorique);
        auditLogRepository.save(auditLog);

        return ReceptionAchatDTO.mapToDTO(reception);
    }

    public ReceptionAchatDTO getReceptionByAchatId(Integer achatId) {
        // Récupérer le bon de commande via l'achat
        BonCommandeAchat bonCommande = bonCommandeAchatRepository.findByProforma_Achat_Id(achatId)
                .orElseThrow(() -> new RuntimeException("BonCommandeAchat not found for achat with id " + achatId));
        
        // Récupérer la réception via le bon de commande
        ReceptionAchat reception = receptionAchatRepository.findByBonCommande_Id(bonCommande.getId())
                .orElseThrow(() -> new RuntimeException("ReceptionAchat not found for bon de commande with id " + bonCommande.getId()));
        
        return ReceptionAchatDTO.mapToDTO(reception);
    }

    public void cloturerAchat(Integer achatId) {
        LocalDateTime now = LocalDateTime.now();
        
        // Récupérer l'achat
        Achat achat = achatRepository.findById(achatId)
                .orElseThrow(() -> new RuntimeException("Achat with id " + achatId + " not found"));
        
        // Récupérer le bon de commande
        BonCommandeAchat bonCommande = bonCommandeAchatRepository.findByProforma_Achat_Id(achatId)
                .orElseThrow(() -> new RuntimeException("BonCommandeAchat not found for achat with id " + achatId));

        // Changer le process de l'achat en valeur 50 (clôturé)
        AchatProcess cloturerProcess = achatProcessRepository.findByValeur(61)
                .orElseThrow(() -> new RuntimeException("AchatProcess with valeur 50 not found"));
        achat.setProcess(cloturerProcess);

        // Ajouter à l'historique de l'achat
        AchatHistorique achatHistorique = new AchatHistorique();
        achatHistorique.setAchat(achat);
        achatHistorique.setProcess(cloturerProcess);
        achatHistorique.setDateEntree(now);

        // Changer le process du bon de commande en valeur 50
        BonCommandeProcess cloturerBonCommandeProcess = bonCommandeProcessRepository.findByValeur(61)
                .orElseThrow(() -> new RuntimeException("BonCommandeProcess with valeur 50 not found"));
        bonCommande.setProcess(cloturerBonCommandeProcess);

        // Ajouter à l'historique du bon de commande
        BonCommandeHistorique bonCommandeHistorique = new BonCommandeHistorique();
        bonCommandeHistorique.setBonCommande(bonCommande);
        bonCommandeHistorique.setProcess(cloturerBonCommandeProcess);
        bonCommandeHistorique.setDateEntree(now);

        // Ajouter dans l'audit log
        Utilisateur currentUser = currentUserUtil.getCurrentUser();
        Action updateAction = actionRepository.findByActionName("UPDATE")
                .orElseThrow(() -> new RuntimeException("Action UPDATE not found"));

        String ids = achat.getId() + ";" + bonCommande.getId() + ";";
        AuditLog auditLog = new AuditLog();
        auditLog.setUtilisateur(currentUser);
        auditLog.setAction(updateAction);
        auditLog.setActionTimestamp(now);
        auditLog.setClasses("Achat;BonCommandeAchat;");
        auditLog.setIdsClasses(ids);
        auditLog.setNewValues("Achat clôturé");
        auditLog.setDetails("Clôture de l'achat " + achat.getRefe() + " et bon de commande " + bonCommande.getRefe());

        // Sauvegarder
        achatRepository.save(achat);
        achatHistoriqueRepository.save(achatHistorique);
        bonCommandeAchatRepository.save(bonCommande);
        bonCommandeHistoriqueRepository.save(bonCommandeHistorique);
        auditLogRepository.save(auditLog);
    }

    
    

  
}
