package com.app.gestion.service;

import com.app.gestion.model.Achat;
import com.app.gestion.model.AchatProcess;
import com.app.gestion.model.AchatLigne;
import com.app.gestion.model.AchatHistorique;
import com.app.gestion.model.Utilisateur;
import com.app.gestion.model.AuditLog;
import com.app.gestion.model.Action;
import com.app.gestion.model.Article;

import com.app.gestion.repository.AchatLigneRepository;
import com.app.gestion.repository.AchatRepository;
import com.app.gestion.repository.ArticleRepository;
import com.app.gestion.repository.AchatHistoriqueRepository;
import com.app.gestion.repository.AchatProcessRepository;
import com.app.gestion.repository.AuditLogRepository;
import com.app.gestion.repository.ActionRepository;

import com.app.gestion.config.CurrentUserUtil;
import com.app.gestion.dto.achat.AchatCreateDTO;
import com.app.gestion.dto.achat.AchatLigneDTO;
import com.app.gestion.dto.achat.AchatCPL;

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
    private CurrentUserUtil currentUserUtil;

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

    // public List<Achat> getAllAchats() {
    //     return achatRepository.findAll();
    // }

    // public Achat getAchatById(Integer id) {
    //     return achatRepository.findById(id).orElseThrow(() -> new RuntimeException("Achat not found"));
    // }

    // public AchatLigne createAchatLigne(AchatLigne achatLigne) {
    //     return achatLigneRepository.save(achatLigne);
    // }

    // public List<AchatLigne> getLignesByAchatId(Integer achatId) {
    //     return achatLigneRepository.findByAchatId(achatId);
    // }
}
