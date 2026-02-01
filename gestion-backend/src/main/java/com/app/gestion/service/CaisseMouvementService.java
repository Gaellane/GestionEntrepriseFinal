package com.app.gestion.service;

import org.springframework.stereotype.Service;

import com.app.gestion.model.CaisseTypeMouvement;
import com.app.gestion.repository.CaisseMouvementRepository;
import com.app.gestion.repository.CaisseTypeMouvementRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CaisseMouvementService {
    private final CaisseMouvementRepository caisseMouvementRepository;
    private final CaisseTypeMouvementRepository caisseTypeMouvementRepository;

    public Double getMontantEnCaisse() throws Exception
    {
        CaisseTypeMouvement typeEntree = caisseTypeMouvementRepository.findById(1).orElseThrow(()-> new Exception("Donnees sur les types de mouvements non inserees ! Corrigez cela "));
        CaisseTypeMouvement typeSortie = caisseTypeMouvementRepository.findById(2).orElseThrow(()-> new Exception("Donnees sur les types de mouvements non inserees ! Corrigez cela "));
        Double entree = caisseMouvementRepository.findMontantTotalByMouvementId(typeEntree.getId()) != null ? caisseMouvementRepository.findMontantTotalByMouvementId(typeEntree.getId()) : 0 ;
        Double sortie = caisseMouvementRepository.findMontantTotalByMouvementId(typeSortie.getId()) != null ? caisseMouvementRepository.findMontantTotalByMouvementId(typeSortie.getId()) : 0;

        return entree - sortie ; 
    }

    public boolean estDepensePossible(Double montantDepense)
    {
        try{
            System.out.println("Montant en caisse:"+getMontantEnCaisse());
            return getMontantEnCaisse() - montantDepense >= 0 ; 
        }
        catch(Exception e)
        {
            e.printStackTrace();
            return false;
        }
    }
}
