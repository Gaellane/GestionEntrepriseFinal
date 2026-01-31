package com.app.gestion.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.app.gestion.dto.UtilisateurDto;
import com.app.gestion.model.Entity;
import com.app.gestion.model.Role;
import com.app.gestion.model.RolesAttributionHistorique;
import com.app.gestion.model.RolesAttributionProcess;
import com.app.gestion.model.Utilisateur;
import com.app.gestion.repository.EntityRepository;
import com.app.gestion.repository.RoleRepository;
import com.app.gestion.repository.RolesAttributionHistoriqueRepository;
import com.app.gestion.repository.RolesAttributionProcessRepository;
import com.app.gestion.repository.UtilisateurRepository;
import com.app.gestion.security.dto.RegisterRequest;

import jakarta.transaction.Transactional;

@Service
public class UtilisateurService {
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private EntityRepository entityRepository;

    @Autowired 
    private RolesAttributionHistoriqueRepository rolesAttributionHistoriqueRepository;

    @Autowired
    private RolesAttributionProcessRepository rolesAttributionProcessRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Utilisateur findById(Integer id) throws Exception
    {
        return utilisateurRepository.findById(id).orElseThrow(()-> new Exception("Utilisateur avec l'id :"+id+" introuvable"));
    }

    public Utilisateur findByEmail(String email) throws Exception
    {
        // Utilisation de la requête avec FETCH JOIN pour éviter LazyInitializationException
        return utilisateurRepository.findByEmailWithRole(email)
            .orElseThrow(()-> new Exception("Utilisateur avec l'email :"+email+" introuvable"));
    } 

    @Transactional
    public Utilisateur createUser(RegisterRequest request) throws Exception {
        System.out.println("Nous allons creer un user");
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new Exception("Rôle introuvable"));
        Entity entity = entityRepository.findById(request.getEntityId())
                .orElseThrow(() -> new Exception("Entité introuvable"));
        
        Utilisateur user = Utilisateur.builder()
                .nom(request.getNom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .role(role)
                .entity(entity)
                .build();
        try {
            // Récupérer le process de validation (id 2)
            RolesAttributionProcess validationProcess = rolesAttributionProcessRepository.findByValeur(2)
                    .orElseThrow(() -> new Exception("Process de validation introuvable"));

            RolesAttributionHistorique rolesAttributionHistorique = new RolesAttributionHistorique();
            rolesAttributionHistorique.setRole(role);
            rolesAttributionHistorique.setProcess(validationProcess);
            rolesAttributionHistorique.setDateEntree(LocalDateTime.now());
            
            Utilisateur savedUser =  utilisateurRepository.save(user);
            rolesAttributionHistorique.setUtilisateur(savedUser);

            rolesAttributionHistoriqueRepository.save(rolesAttributionHistorique);

            return savedUser;
            
        } catch (Exception e) {
            throw new Exception("Erreur lors de l'enregistrement de l'utilisateur");
        }
    }


    public List<UtilisateurDto> getAllUtilisateurs()
    {
        List<Utilisateur> utilisateurs = utilisateurRepository.findAll();
        return utilisateurs.stream().map(u -> u.convertToDto()).toList();
    }

    public UtilisateurDto getUtilisateurByEmail(String email) throws Exception
    {
        return utilisateurRepository.findByEmail(email).orElseThrow(()-> new Exception("Utilisateur avec l'email :"+email+" introuvable")).convertToDto();   
    }

    public UtilisateurDto getUtilisateurById(Integer id) throws Exception
    {
        return utilisateurRepository.findById(id).orElseThrow(()-> new Exception("Utilisateur avec l'id :"+id+" introuvable")).convertToDto();
    }
}
