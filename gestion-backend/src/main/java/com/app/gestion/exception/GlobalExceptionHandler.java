package com.app.gestion.exception;

import com.app.gestion.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @Value("${app.debug-exceptions:false}")
    private boolean debugExceptions;

    /* ===================== EXCEPTIONS MÉTIER ===================== */

    @ExceptionHandler(RemiseException.class)
    public ResponseEntity<ApiResponse<Object>> handleRemiseException(RemiseException ex, WebRequest request) {
        Map<String, Object> data = new HashMap<>();
        data.put("timestamp", LocalDateTime.now());
        data.put("remiseDemandee", ex.getRemiseDemandee());
        data.put("remiseMax", ex.getRemiseMax());
        data.put("roleUtilisateur", ex.getRoleUtilisateur());
        data.put("requiresValidation", ex.isRequiresValidation());

        if (debugExceptions) {
            data.put("exception", ex.getClass().getName());
            data.put("details", ex.getMessage());
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, ex.getMessage(), data));
    }

    @ExceptionHandler(InsufficientQuantityException.class)
    public ResponseEntity<ApiResponse<Object>> handleInsufficientQuantity(InsufficientQuantityException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex);
    }

    /* ===================== ERREURS CLIENT ===================== */

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(IllegalArgumentException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntime(RuntimeException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex);
    }

    /* ===================== ERREUR GÉNÉRALE ===================== */

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleAll(Exception ex) {
        ApiResponse<Object> body = new ApiResponse<>(
                false,
                "Une erreur interne est survenue",
                debugExceptions ? buildDebugData(ex) : null
        );
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(body);
    }

    /* ===================== MÉTHODES UTILITAIRES ===================== */

    private ResponseEntity<ApiResponse<Object>> buildError(HttpStatus status, Exception ex) {
        ApiResponse<Object> body = new ApiResponse<>(
                false,
                ex.getMessage(),
                debugExceptions ? buildDebugData(ex) : null
        );
        return ResponseEntity.status(status).body(body);
    }

    private Map<String, Object> buildDebugData(Exception ex) {
        Map<String, Object> data = new HashMap<>();
        data.put("exception", ex.getClass().getName());
        data.put("stackTrace", getStackTrace(ex));
        return data;
    }

    private String getStackTrace(Exception ex) {
        StringBuilder sb = new StringBuilder();
        for (StackTraceElement el : ex.getStackTrace()) {
            sb.append(el).append("\n");
        }
        return sb.toString();
    }
}
