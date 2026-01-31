package com.app.gestion.controller;

import com.app.gestion.dto.configuration.ConfigurationRequestDto;
import com.app.gestion.dto.configuration.ConfigurationResponseDto;
import com.app.gestion.service.ConfigurationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/configurations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConfigurationController {

    private final ConfigurationService configurationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_DIRECTION')")
    public ResponseEntity<List<ConfigurationResponseDto>> getAllConfigurations() {
        List<ConfigurationResponseDto> configurations = configurationService.getAllConfigurations();
        return ResponseEntity.ok(configurations);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_DIRECTION')")
    public ResponseEntity<ConfigurationResponseDto> getConfigurationById(@PathVariable Integer id) {
        ConfigurationResponseDto configuration = configurationService.getConfigurationById(id);
        return ResponseEntity.ok(configuration);
    }

    @GetMapping("/key/{configKey}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_DIRECTION', 'RESP_VENTE', 'RESP_ACHAT', 'EMP_VENTE', 'EMP_ACHAT')")
    public ResponseEntity<ConfigurationResponseDto> getConfigurationByKey(@PathVariable String configKey) {
        ConfigurationResponseDto configuration = configurationService.getConfigurationByKey(configKey);
        return ResponseEntity.ok(configuration);
    }

    @GetMapping("/remise-max/{roleCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_DIRECTION', 'RESP_VENTE', 'RESP_ACHAT', 'EMP_VENTE', 'EMP_ACHAT')")
    public ResponseEntity<Map<String, Object>> getRemiseMaxByRole(@PathVariable String roleCode) {
        Double remiseMax = configurationService.getRemiseMaxByRole(roleCode);
        Map<String, Object> response = new HashMap<>();
        response.put("roleCode", roleCode);
        response.put("remiseMax", remiseMax);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createConfiguration(
            @Valid @RequestBody ConfigurationRequestDto requestDto) {
        try {
            ConfigurationResponseDto createdConfig = configurationService.createConfiguration(requestDto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Configuration créée avec succès");
            response.put("data", createdConfig);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateConfiguration(
            @PathVariable Integer id,
            @Valid @RequestBody ConfigurationRequestDto requestDto) {
        try {
            ConfigurationResponseDto updatedConfig = configurationService.updateConfiguration(id, requestDto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Configuration modifiée avec succès");
            response.put("data", updatedConfig);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteConfiguration(@PathVariable Integer id) {
        try {
            configurationService.deleteConfiguration(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Configuration supprimée avec succès");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
