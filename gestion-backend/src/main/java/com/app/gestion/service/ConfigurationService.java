package com.app.gestion.service;

import com.app.gestion.dto.configuration.ConfigurationRequestDto;
import com.app.gestion.dto.configuration.ConfigurationResponseDto;
import com.app.gestion.model.Action;
import com.app.gestion.model.AuditLog;
import com.app.gestion.model.Configuration;
import com.app.gestion.model.Utilisateur;
import com.app.gestion.repository.ActionRepository;
import com.app.gestion.repository.AuditLogRepository;
import com.app.gestion.repository.ConfigurationRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class ConfigurationService {

    private final ConfigurationRepository configurationRepository;
    private final AuditLogRepository auditLogRepository;
    private final ActionRepository actionRepository;


    @Transactional(readOnly = true)
    public List<ConfigurationResponseDto> getAllConfigurations() {
        return configurationRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConfigurationResponseDto getConfigurationById(Integer id) {
        Configuration config = configurationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuration non trouvée avec l'id: " + id));
        return mapToResponseDto(config);
    }

    @Transactional(readOnly = true)
    public ConfigurationResponseDto getConfigurationByKey(String configKey) {
        Configuration config = configurationRepository.findByConfigKey(configKey)
                .orElseThrow(() -> new RuntimeException("Configuration non trouvée avec la clé: " + configKey));
        return mapToResponseDto(config);
    }

    @Transactional(readOnly = true)
    public Double getRemiseMaxByRole(String roleCode) {
        String configKey;
        switch (roleCode) {
            case "RESP_VENTE":
            case "RESP_ACHAT":
            case "RESP_MAGASIN":
            case "RESP_FINANCE":
            case "RESP_DIRECTION":
                configKey = "REMISE_MAX_RESPONSABLE";
                break;
            case "EMP_VENTE":
            case "EMP_ACHAT":
            case "EMP_MAGASIN":
            case "EMP_FINANCE":
                configKey = "REMISE_MAX_COMMERCIAL";
                break;
            case "ADMIN":
                return 100.0; // Admin a accès illimité
            default:
                return 0.0; // Par défaut, pas de remise
        }

        try {
            Configuration config = configurationRepository.findByConfigKey(configKey)
                    .orElseThrow(() -> new RuntimeException("Configuration de remise non trouvée"));
            return Double.parseDouble(config.getConfigValue());
        } catch (NumberFormatException e) {
            log.error("Erreur de parsing de la valeur de remise pour {}: {}", configKey, e.getMessage());
            return 0.0;
        }
    }

    @Transactional
    public ConfigurationResponseDto createConfiguration(ConfigurationRequestDto requestDto) {
        // Vérifier si la clé existe déjà
        if (configurationRepository.findByConfigKey(requestDto.getConfigKey()).isPresent()) {
            throw new RuntimeException("Une configuration avec cette clé existe déjà");
        }

        Configuration config = Configuration.builder()
                .configKey(requestDto.getConfigKey())
                .configValue(requestDto.getConfigValue())
                .description(requestDto.getDescription())
                .build();

        Configuration savedConfig = configurationRepository.save(config);

        // Journalisation
        logAction("CREATE", null, savedConfig, "Création de la configuration");

        return mapToResponseDto(savedConfig);
    }

    @Transactional
    public ConfigurationResponseDto updateConfiguration(Integer id, ConfigurationRequestDto requestDto) {
        Configuration existingConfig = configurationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuration non trouvée avec l'id: " + id));

        // Vérifier si la nouvelle clé n'est pas déjà utilisée par une autre
        // configuration
        if (!existingConfig.getConfigKey().equals(requestDto.getConfigKey()) &&
                configurationRepository.findByConfigKey(requestDto.getConfigKey()).isPresent()) {
            throw new RuntimeException("Une autre configuration avec cette clé existe déjà");
        }

        // Sauvegarder l'ancien état
        Configuration oldConfig = Configuration.builder()
                .id(existingConfig.getId())
                .configKey(existingConfig.getConfigKey())
                .configValue(existingConfig.getConfigValue())
                .description(existingConfig.getDescription())
                .build();

        // Mise à jour
        existingConfig.setConfigKey(requestDto.getConfigKey());
        existingConfig.setConfigValue(requestDto.getConfigValue());
        existingConfig.setDescription(requestDto.getDescription());

        Configuration updatedConfig = configurationRepository.save(existingConfig);

        // Journalisation
        logAction("UPDATE", oldConfig, updatedConfig, "Modification de la configuration");

        return mapToResponseDto(updatedConfig);
    }

    @Transactional
    public void deleteConfiguration(Integer id) {
        Configuration config = configurationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuration non trouvée avec l'id: " + id));

        // Journalisation
        logAction("DELETE", config, null, "Suppression de la configuration");

        configurationRepository.delete(config);
    }

    // Méthodes utilitaires privées

    private ConfigurationResponseDto mapToResponseDto(Configuration config) {
        return ConfigurationResponseDto.builder()
                .id(config.getId())
                .configKey(config.getConfigKey())
                .configValue(config.getConfigValue())
                .description(config.getDescription())
                .build();
    }

    private void logAction(String actionName, Configuration oldConfig, Configuration newConfig, String details) {
        try {
            Action action = actionRepository.findByActionName(actionName)
                    .orElseThrow(() -> new RuntimeException("Action non trouvée: " + actionName));

            Utilisateur utilisateur = getCurrentUser();

            String oldValues = oldConfig != null ? convertConfigToJson(oldConfig) : null;
            String newValues = newConfig != null ? convertConfigToJson(newConfig) : null;
            String idsClasses = newConfig != null ? String.valueOf(newConfig.getId())
                    : (oldConfig != null ? String.valueOf(oldConfig.getId()) : "");

            AuditLog auditLog = AuditLog.builder()
                    .utilisateur(utilisateur)
                    .action(action)
                    .classes("Configuration")
                    .idsClasses(idsClasses)
                    .actionTimestamp(LocalDateTime.now())
                    .oldValues(oldValues)
                    .newValues(newValues)
                    .details(details)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Action {} journalisée pour la configuration {}", actionName, idsClasses);
        } catch (Exception e) {
            log.error("Erreur lors de la journalisation de l'action {}: {}", actionName, e.getMessage());
        }
    }

    private String convertConfigToJson(Configuration config) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> configMap = new HashMap<>();
            configMap.put("id", config.getId());
            configMap.put("configKey", config.getConfigKey());
            configMap.put("configValue", config.getConfigValue());
            configMap.put("description", config.getDescription());
            return objectMapper.writeValueAsString(configMap);
        } catch (JsonProcessingException e) {
            log.error("Erreur lors de la conversion de la configuration en JSON", e);
            return "{}";
        }
    }

    private Utilisateur getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Utilisateur) {
            return (Utilisateur) authentication.getPrincipal();
        }
        return null;
    }
}
