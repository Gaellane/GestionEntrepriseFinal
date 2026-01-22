package com.app.gestion.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.app.gestion.model.Entity;
import com.app.gestion.model.Role;
import com.app.gestion.model.Utilisateur;
import com.app.gestion.repository.EntityRepository;
import com.app.gestion.repository.RoleRepository;
import com.app.gestion.repository.UtilisateurRepository;
import com.app.gestion.security.dto.RegisterRequest;

@Service
public class UtilisateurService {
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private EntityRepository entityRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Utilisateur findById(Integer id) throws Exception
    {
        return utilisateurRepository.findById(id).orElseThrow(()-> new Exception("Utilisateur avec l'id :"+id+" introuvable"));
    }

    public Utilisateur findByEmail(String email) throws Exception
    {
        return utilisateurRepository.findByEmail(email).orElseThrow(()-> new Exception("Utilisateur avec l'email :"+email+" introuvable"));
    } 

    public Utilisateur createUser(RegisterRequest request) throws Exception {
        // Role role = roleRepository.findById(request.getRoleId())
        //         .orElseThrow(() -> new Exception("Rôle introuvable"));
        Entity entity = entityRepository.findById(request.getEntityId())
                .orElseThrow(() -> new Exception("Entité introuvable"));
        
        Utilisateur user = Utilisateur.builder()
                .nom(request.getNom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                // .role(role)
                .entity(entity)
                .build();
        try {
            return utilisateurRepository.save(user);
            
        } catch (Exception e) {
            throw new Exception("Erreur lors de l'enregistrement de l'utilisateur");
        }
    }
}
