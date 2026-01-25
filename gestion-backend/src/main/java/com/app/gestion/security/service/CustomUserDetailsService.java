package com.app.gestion.security.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.app.gestion.model.Utilisateur;
import com.app.gestion.service.UtilisateurService;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UtilisateurService utilisateurService;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        
        try {
            System.out.println("Looking for an user with the email:"+email);
            Utilisateur utilisateur = utilisateurService.findByEmail(email);
            
            System.out.println("This user has the password:"+utilisateur.getMotDePasse());
            System.out.println("User role: " + utilisateur.getRole().getRoleCode());
            
            return new org.springframework.security.core.userdetails.User(
            utilisateur.getEmail(),
            utilisateur.getMotDePasse(),
            List.of(new SimpleGrantedAuthority(utilisateur.getRole().getRoleCode()))
        );
            
        } catch (Exception e) {
            e.printStackTrace();
            throw new UsernameNotFoundException(e.getMessage());
        }

    }
    
}
