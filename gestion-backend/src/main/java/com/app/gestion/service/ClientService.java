package com.app.gestion.service;

import com.app.gestion.dto.client.ClientRequestDto;
import com.app.gestion.dto.client.ClientResponseDto;
import com.app.gestion.dto.common.PageResponseDto;
import com.app.gestion.model.Action;
import com.app.gestion.model.AuditLog;
import com.app.gestion.model.Client;
import com.app.gestion.model.Utilisateur;
import com.app.gestion.repository.ActionRepository;
import com.app.gestion.repository.AuditLogRepository;
import com.app.gestion.repository.ClientRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientService {

    private final ClientRepository clientRepository;
    private final AuditLogRepository auditLogRepository;
    private final ActionRepository actionRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public PageResponseDto<ClientResponseDto> getAllClients(Pageable pageable) {
        Page<Client> clientPage = clientRepository.findAll(pageable);
        return mapToPageResponse(clientPage);
    }

    @Transactional(readOnly = true)
    public PageResponseDto<ClientResponseDto> searchClients(String searchTerm, Pageable pageable) {
        Page<Client> clientPage;
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            clientPage = clientRepository.findAll(pageable);
        } else {
            clientPage = clientRepository.searchClients(searchTerm.trim(), pageable);
        }
        return mapToPageResponse(clientPage);
    }

    @Transactional(readOnly = true)
    public ClientResponseDto getClientById(Integer id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé avec l'id: " + id));
        return mapToResponseDto(client);
    }

    @Transactional
    public ClientResponseDto createClient(ClientRequestDto requestDto) {
        // Validation métier supplémentaire
        if (clientRepository.existsByClientNomIgnoreCase(requestDto.getClientNom())) {
            throw new RuntimeException("Un client avec ce nom existe déjà");
        }

        Client client = Client.builder()
                .clientNom(requestDto.getClientNom())
                .contact(requestDto.getContact())
                .adresse(requestDto.getAdresse())
                .coordonneeBancaire(requestDto.getCoordonneeBancaire())
                .build();

        Client savedClient = clientRepository.save(client);

        // Journalisation de l'action CREATE
        logAction("CREATE", null, savedClient, "Création du client");

        return mapToResponseDto(savedClient);
    }

    @Transactional
    public ClientResponseDto updateClient(Integer id, ClientRequestDto requestDto) {
        Client existingClient = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé avec l'id: " + id));

        // Validation: vérifier si un autre client a le même nom
        if (!existingClient.getClientNom().equalsIgnoreCase(requestDto.getClientNom()) &&
                clientRepository.existsByClientNomIgnoreCase(requestDto.getClientNom())) {
            throw new RuntimeException("Un autre client avec ce nom existe déjà");
        }

        // Sauvegarder l'ancien état pour l'audit
        Client oldClient = Client.builder()
                .id(existingClient.getId())
                .clientNom(existingClient.getClientNom())
                .contact(existingClient.getContact())
                .adresse(existingClient.getAdresse())
                .coordonneeBancaire(existingClient.getCoordonneeBancaire())
                .build();

        // Mise à jour des champs
        existingClient.setClientNom(requestDto.getClientNom());
        existingClient.setContact(requestDto.getContact());
        existingClient.setAdresse(requestDto.getAdresse());
        existingClient.setCoordonneeBancaire(requestDto.getCoordonneeBancaire());

        Client updatedClient = clientRepository.save(existingClient);

        // Journalisation de l'action UPDATE
        logAction("UPDATE", oldClient, updatedClient, "Modification du client");

        return mapToResponseDto(updatedClient);
    }

    @Transactional
    public void deleteClient(Integer id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé avec l'id: " + id));

        // Journalisation de l'action DELETE
        logAction("DELETE", client, null, "Suppression du client");

        clientRepository.delete(client);
    }

    @Transactional(readOnly = true)
    public List<ClientResponseDto> searchClientsByName(String clientNom) {
        List<Client> clients = clientRepository.findByClientNomContainingIgnoreCase(clientNom);
        return clients.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // Méthodes utilitaires privées

    private PageResponseDto<ClientResponseDto> mapToPageResponse(Page<Client> clientPage) {
        List<ClientResponseDto> content = clientPage.getContent().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        return PageResponseDto.<ClientResponseDto>builder()
                .content(content)
                .pageNumber(clientPage.getNumber())
                .pageSize(clientPage.getSize())
                .totalElements(clientPage.getTotalElements())
                .totalPages(clientPage.getTotalPages())
                .last(clientPage.isLast())
                .first(clientPage.isFirst())
                .build();
    }

    private ClientResponseDto mapToResponseDto(Client client) {
        return ClientResponseDto.builder()
                .id(client.getId())
                .clientNom(client.getClientNom())
                .contact(client.getContact())
                .adresse(client.getAdresse())
                .coordonneeBancaire(client.getCoordonneeBancaire())
                .build();
    }

    private void logAction(String actionName, Client oldClient, Client newClient, String details) {
        try {
            Action action = actionRepository.findByActionName(actionName)
                    .orElseThrow(() -> new RuntimeException("Action non trouvée: " + actionName));

            Utilisateur utilisateur = getCurrentUser();

            String oldValues = oldClient != null ? convertClientToJson(oldClient) : null;
            String newValues = newClient != null ? convertClientToJson(newClient) : null;
            String idsClasses = newClient != null ? String.valueOf(newClient.getId())
                    : (oldClient != null ? String.valueOf(oldClient.getId()) : "");

            AuditLog auditLog = AuditLog.builder()
                    .utilisateur(utilisateur)
                    .action(action)
                    .classes("Client")
                    .idsClasses(idsClasses)
                    .actionTimestamp(LocalDateTime.now())
                    .oldValues(oldValues)
                    .newValues(newValues)
                    .details(details)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Action {} journalisée pour le client {}", actionName, idsClasses);
        } catch (Exception e) {
            log.error("Erreur lors de la journalisation de l'action {}: {}", actionName, e.getMessage());
            // Ne pas propager l'erreur pour ne pas bloquer l'opération principale
        }
    }

    private String convertClientToJson(Client client) {
        try {
            Map<String, Object> clientMap = new HashMap<>();
            clientMap.put("id", client.getId());
            clientMap.put("clientNom", client.getClientNom());
            clientMap.put("contact", client.getContact());
            clientMap.put("adresse", client.getAdresse());
            clientMap.put("coordonneeBancaire", client.getCoordonneeBancaire());
            return objectMapper.writeValueAsString(clientMap);
        } catch (JsonProcessingException e) {
            log.error("Erreur lors de la conversion du client en JSON", e);
            return "{}";
        }
    }

    private Utilisateur getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Utilisateur) {
            return (Utilisateur) authentication.getPrincipal();
        }
        // Si l'utilisateur n'est pas trouvé, retourner null ou lever une exception
        // selon les besoins de votre application
        return null;
    }
}
