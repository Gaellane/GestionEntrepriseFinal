package com.app.gestion.controller;

import com.app.gestion.dto.ApiResponse;
import com.app.gestion.dto.AuditLogDto;
import com.app.gestion.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ApiResponse<Page<AuditLogDto>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "actionTimestamp") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        try {
            System.out.println("[AuditLogController] Loading audit logs - Page: " + page + ", Size: " + size);
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            Page<AuditLogDto> auditLogs = auditLogService.getAllAuditLogs(pageable);
            System.out.println("[AuditLogController] Found " + auditLogs.getTotalElements() + " audit logs");
            return new ApiResponse<>(true, "OK", auditLogs);
        } catch (Exception e) {
            System.err.println("[AuditLogController] Error: " + e.getMessage());
            e.printStackTrace();
            return new ApiResponse<>(false, "Error loading audit logs: " + e.getMessage(), null);
        }
    }
}
