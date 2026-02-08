package com.app.gestion.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.app.gestion.ai.tool.AiTool;
import com.app.gestion.repository.UniteRepository;
import com.app.gestion.model.Unite;

import java.util.List;

@Service
public class UniteService {
    
    @Autowired
    private UniteRepository uniteRepository;

    public Unite getUniteById(Integer id) throws Exception {
        return uniteRepository.findById(id)
                .orElseThrow(() -> new Exception("Unité avec l'id :" + id + " introuvable"));
    }

    @AiTool(
        name = "recuperer_toutes_unites",
        description = "Récupère la liste complète de toutes les unités de mesure configurées dans le système (ex: kg, litre, pièce, mètre, etc.). Chaque unité contient un nom et une abréviation. Permet de connaître les unités disponibles pour la saisie des quantités d'articles.",
        domain = "stock",
        readOnly = true
    )
    public List<Unite> getAllUnites() {
        return uniteRepository.findAll();
    }

    public Unite createUnite(Unite unite) {
        return uniteRepository.save(unite);
    }

    public Unite updateUnite(Integer id, Unite uniteDetails) throws Exception {
        Unite unite = getUniteById(id);
        unite.setUniteName(uniteDetails.getUniteName());
        unite.setAbreviation(uniteDetails.getAbreviation());
        return uniteRepository.save(unite);
    }

    public void deleteUnite(Integer id) throws Exception {
        Unite unite = getUniteById(id);
        uniteRepository.delete(unite);
    }


}
