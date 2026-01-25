package com.app.gestion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private Integer id;
    private Integer userId;
    private String actionLabel;
    private String classes;
    private String idsClasses;
    private LocalDateTime actionTimestamp;
    private String oldValues;
    private String newValues;
    private String details;
}
