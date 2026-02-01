package com.app.gestion.controller;

import com.app.gestion.dto.client.ClientRequestDto;
import com.app.gestion.dto.client.ClientResponseDto;
import com.app.gestion.dto.common.PageResponseDto;
import com.app.gestion.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE', 'RESP_DIRECTION')")
    public ResponseEntity<PageResponseDto<ClientResponseDto>> getAllClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponseDto<ClientResponseDto> response = clientService.getAllClients(pageable);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE', 'RESP_DIRECTION')")
    public ResponseEntity<PageResponseDto<ClientResponseDto>> searchClients(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponseDto<ClientResponseDto> response = clientService.searchClients(searchTerm, pageable);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-name")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE', 'RESP_DIRECTION')")
    public ResponseEntity<List<ClientResponseDto>> searchClientsByName(
            @RequestParam String clientNom) {

        List<ClientResponseDto> clients = clientService.searchClientsByName(clientNom);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE', 'RESP_DIRECTION')")
    public ResponseEntity<ClientResponseDto> getClientById(@PathVariable Integer id) {
        ClientResponseDto client = clientService.getClientById(id);
        return ResponseEntity.ok(client);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<Map<String, Object>> createClient(@Valid @RequestBody ClientRequestDto requestDto) {
        try {
            ClientResponseDto createdClient = clientService.createClient(requestDto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Client créé avec succès");
            response.put("data", createdClient);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE', 'EMP_VENTE')")
    public ResponseEntity<Map<String, Object>> updateClient(
            @PathVariable Integer id,
            @Valid @RequestBody ClientRequestDto requestDto) {
        try {
            ClientResponseDto updatedClient = clientService.updateClient(id, requestDto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Client modifié avec succès");
            response.put("data", updatedClient);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESP_VENTE')")
    public ResponseEntity<Map<String, Object>> deleteClient(@PathVariable Integer id) {
        try {
            clientService.deleteClient(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Client supprimé avec succès");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
