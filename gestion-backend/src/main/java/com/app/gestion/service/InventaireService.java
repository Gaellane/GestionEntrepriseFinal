package com.app.gestion.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.app.gestion.model.Inventaire;
import com.app.gestion.model.InventaireHistorique;
import com.app.gestion.model.InventaireProcess;
import com.app.gestion.model.Utilisateur;
import com.app.gestion.repository.InventaireHistoriqueRepository;
import com.app.gestion.repository.InventaireProcessRepository;
import com.app.gestion.repository.InventaireRepository;
import com.app.gestion.repository.UtilisateurRepository;

import jakarta.transaction.Transactional;

import com.app.gestion.dto.stock.InventaireDTO;
import com.app.gestion.dto.stock.InventaireLigneRequest;
import com.app.gestion.model.InventaireLigne;
import com.app.gestion.repository.InventaireLigneRepository;
import com.app.gestion.repository.ArticleRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventaireService {

    private final InventaireRepository inventaireRepository;
    private final InventaireProcessRepository inventaireProcessRepository;
    private final InventaireHistoriqueRepository inventaireHistoriqueRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final com.app.gestion.repository.DepotRepository depotRepository;
    private final InventaireLigneRepository inventaireLigneRepository;
    private final ArticleRepository articleRepository;

    public InventaireService(InventaireRepository inventaireRepository,
                             InventaireProcessRepository inventaireProcessRepository,
                             InventaireHistoriqueRepository inventaireHistoriqueRepository,
                             UtilisateurRepository utilisateurRepository,
                             com.app.gestion.repository.DepotRepository depotRepository,
                             InventaireLigneRepository inventaireLigneRepository,
                             ArticleRepository articleRepository) {
        this.inventaireRepository = inventaireRepository;
        this.inventaireProcessRepository = inventaireProcessRepository;
        this.inventaireHistoriqueRepository = inventaireHistoriqueRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.depotRepository = depotRepository;
        this.inventaireLigneRepository = inventaireLigneRepository;
        this.articleRepository = articleRepository;
    }

    @Transactional
    public Inventaire createRequest(Integer utilisateurId, Integer depotId, String details) {
        Utilisateur u = utilisateurRepository.findById(utilisateurId).orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        com.app.gestion.model.Depot depot = depotRepository.findById(depotId).orElseThrow(() -> new IllegalArgumentException("Depot non trouvé"));

        Inventaire inv = Inventaire.builder()
            .utilisateur(u)
            .dateEntree(LocalDateTime.now())
            .depot(depot)
            .details(details)
            .build();

        // Correct depot: the Inventaire entity expects Depot relation; but to keep this small change,
        // we set depot via repository after fetching depot by id in controller if needed.

        Inventaire saved = inventaireRepository.save(inv);

        InventaireProcess p = inventaireProcessRepository.findByAbreviation("CRE");
        if (p != null) {
            InventaireHistorique h = InventaireHistorique.builder()
                    .dateEntree(LocalDateTime.now())
                    .inventaire(saved)
                    .process(p)
                    .utilisateur(u)
                    .build();
            inventaireHistoriqueRepository.save(h);
        }

        return saved;
    }

    @Transactional
    public Inventaire validateRequest(Integer inventaireId, Integer validatorUserId) {
        Inventaire inv = inventaireRepository.findById(inventaireId).orElseThrow(() -> new IllegalArgumentException("Inventaire non trouvé"));
        Utilisateur validator = utilisateurRepository.findById(validatorUserId).orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        InventaireProcess p = inventaireProcessRepository.findByAbreviation("VAL");
        if (p == null) {
            throw new IllegalArgumentException("Processus de validation introuvable");
        }

        InventaireHistorique h = InventaireHistorique.builder()
                .dateEntree(LocalDateTime.now())
                .inventaire(inv)
                .process(p)
                .utilisateur(validator)
                .build();
        inventaireHistoriqueRepository.save(h);

        return inv;
    }

    public List<InventaireDTO> listDemandes() {
        var list = inventaireRepository.findAll()
                .stream()
                .map(inv -> {
                    boolean validated = inventaireHistoriqueRepository.existsByInventaire_IdAndProcess_Abreviation(inv.getId(), "VAL");
                    return InventaireDTO.fromEntity(inv, validated);
                })
                .collect(Collectors.toList());
        System.out.println("[InventaireService] listDemandes -> count=" + (list == null ? 0 : list.size()));
        return list;
    }

    public List<InventaireDTO> listDemandesForUser(Integer utilisateurId) {
        var list = inventaireRepository.findByUtilisateur_Id(utilisateurId)
                .stream()
                .map(inv -> {
                    boolean validated = inventaireHistoriqueRepository.existsByInventaire_IdAndProcess_Abreviation(inv.getId(), "VAL");
                    return InventaireDTO.fromEntity(inv, validated);
                })
                .collect(Collectors.toList());
        System.out.println("[InventaireService] listDemandesForUser(" + utilisateurId + ") -> count=" + (list == null ? 0 : list.size()));
        return list;
    }

    @Transactional
    public java.util.List<InventaireLigne> addLignesToInventaire(InventaireLigneRequest request) {
        if (request == null || request.getInventaireId() == null) {
            throw new IllegalArgumentException("inventaireId requis");
        }

        Inventaire inv = inventaireRepository.findById(request.getInventaireId())
                .orElseThrow(() -> new IllegalArgumentException("Inventaire non trouvé"));

        var lignes = request.getLignes() == null ? java.util.List.<InventaireLigne>of() :
                request.getLignes().stream().map(l -> {
                    var article = articleRepository.findById(l.getArticleId())
                            .orElseThrow(() -> new IllegalArgumentException("Article non trouvé: " + l.getArticleId()));
                    return InventaireLigne.builder()
                            .inventaire(inv)
                            .article(article)
                            .quantite(l.getQuantite() == null ? 0.0 : l.getQuantite())
                            .build();
                }).collect(Collectors.toList());

        if (lignes.isEmpty()) return java.util.List.of();

        return inventaireLigneRepository.saveAll(lignes);
    }
}
