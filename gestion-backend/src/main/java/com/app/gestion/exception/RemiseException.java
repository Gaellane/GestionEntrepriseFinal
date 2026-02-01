package com.app.gestion.exception;

public class RemiseException extends RuntimeException {
    private final Double remiseDemandee;
    private final Double remiseMax;
    private final String roleUtilisateur;
    private final boolean requiresValidation;

    public RemiseException(String message, Double remiseDemandee, Double remiseMax, String roleUtilisateur, boolean requiresValidation) {
        super(message);
        this.remiseDemandee = remiseDemandee;
        this.remiseMax = remiseMax;
        this.roleUtilisateur = roleUtilisateur;
        this.requiresValidation = requiresValidation;
    }

    public Double getRemiseDemandee() {
        return remiseDemandee;
    }

    public Double getRemiseMax() {
        return remiseMax;
    }

    public String getRoleUtilisateur() {
        return roleUtilisateur;
    }

    public boolean isRequiresValidation() {
        return requiresValidation;
    }
}
