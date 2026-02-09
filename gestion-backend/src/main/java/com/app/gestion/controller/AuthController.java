package com.app.gestion.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.app.gestion.model.Utilisateur;
import com.app.gestion.security.dto.AuthRequest;
import com.app.gestion.security.dto.RegisterRequest;
import com.app.gestion.security.jwt.JwtUtil;
import com.app.gestion.service.UtilisateurService;

@RestController
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UtilisateurService utilisateurService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Map<String,Object> response = new HashMap<>();
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getMotDePasse()
                    )
            );
    
            UserDetails user = (UserDetails) auth.getPrincipal();
            Utilisateur dbUser = utilisateurService.findByEmail(user.getUsername());
    
            String token = jwtUtil.generateToken(user);
            Map<String,Object> userData = new HashMap<>();
                userData.put("name",dbUser.getNom());
                userData.put("role",dbUser.getRole().getRoleCode());
    
            response.put("token", token);
            response.put("user", userData);
    
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }


    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            Utilisateur user = utilisateurService.createUser(request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Utilisateur créé avec succès");
            response.put("userId", user.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
}
