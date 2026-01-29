package com.app.gestion.controller;

import com.app.gestion.dto.ApiResponse;
import com.app.gestion.dto.stock.StockKpiDTO;
import com.app.gestion.dto.stock.AjustementFormData;
import com.app.gestion.dto.stock.DepotDTO;
import com.app.gestion.service.StockKpiService;
import com.app.gestion.service.DepotService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/stock/kpis")
public class StockKpiController {

    private final StockKpiService stockKpiService;
    private final DepotService depotService;

    public StockKpiController(StockKpiService stockKpiService, DepotService depotService) {
        this.stockKpiService = stockKpiService;
        this.depotService = depotService;
    }

    @GetMapping("/precision")
    @PreAuthorize("hasAuthority('RESP_MAGASINIER,ADMIN')")
    public ApiResponse<StockKpiDTO> getStockPrecision(
            @RequestParam(required = false) Integer depotId,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin) {
        try {
            StockKpiDTO kpi = stockKpiService.calculateStockPrecision(depotId, categoryId, dateDebut, dateFin);
            return new ApiResponse<>(true, "KPIs calculés avec succès", kpi);
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, "Erreur lors du calcul des KPIs: " + e.getMessage(), null);
        }
    }

    @GetMapping("/ajustement-form-data")
    @PreAuthorize("hasAuthority('RESP_MAGASINIER,ADMIN')")
    public ApiResponse<AjustementFormData> getAjustementFormData(
            @RequestParam(required = false) Integer depotId,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin) {
        try {
            StockKpiDTO kpiData = stockKpiService.calculateStockPrecision(depotId, categoryId, dateDebut, dateFin);
            List<DepotDTO> depots = depotService.getAllForCurrentUser();
            
            AjustementFormData formData = AjustementFormData.builder()
                    .kpiData(kpiData)
                    .depots(depots)
                    .build();
            
            return new ApiResponse<>(true, "Données du formulaire récupérées avec succès", formData);
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, "Erreur lors de la récupération des données: " + e.getMessage(), null);
        }
    }

    @GetMapping("/articles/remaining")
    @PreAuthorize("hasAnyAuthority('MAGSORT','MAGRECEP','MAGASINIER')")
    public ApiResponse<List<com.app.gestion.dto.stock.ArticleRemainingDTO>> getArticlesRemaining(
            @RequestParam(required = false) Integer depotId,
            @RequestParam(required = false) Integer categoryId) {
        try {
            List<com.app.gestion.dto.stock.ArticleRemainingDTO> list = stockKpiService.getRemainingStockByArticle(depotId, categoryId);
            return new ApiResponse<>(true, "OK", list);
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, "Erreur lors de la récupération des articles restants: " + e.getMessage(), null);
        }
    }

    @GetMapping("/lots/risk")
    @PreAuthorize("hasAuthority('RESP_MAGASINIER,ADMIN')")
    public ApiResponse<List<com.app.gestion.dto.stock.LotDTO>> getRiskyLots(
            @RequestParam(required = false) Integer depotId,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin) {
        try {
            List<com.app.gestion.dto.stock.LotDTO> list = stockKpiService.getRiskyLots(depotId, categoryId, dateDebut, dateFin);
            return new ApiResponse<>(true, "OK", list);
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, "Erreur lors de la récupération des lots à risque: " + e.getMessage(), null);
        }
    }
}
