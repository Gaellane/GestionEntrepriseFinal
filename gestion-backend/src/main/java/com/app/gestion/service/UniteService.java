package com.app.gestion.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

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
