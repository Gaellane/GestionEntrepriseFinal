import api from './index';

/**
 * API pour les KPI et Reporting des ventes (9.1 - 9.5)
 */

// =========== 9.1 KPI COMMERCIAL ===========

/**
 * Récupérer les KPI du responsable commercial
 */
export const getKpiCommercial = async (params = {}) => {
    const response = await api.get('/reporting/ventes/kpi/commercial', { params });
    return response.data;
};

// =========== 9.2 KPI FINANCE ===========

/**
 * Récupérer les KPI finance
 */
export const getKpiFinance = async (params = {}) => {
    const response = await api.get('/reporting/ventes/kpi/finance', { params });
    return response.data;
};

// =========== 9.3 KPI DIRECTION ===========

/**
 * Récupérer les KPI direction générale
 */
export const getKpiDirection = async (params = {}) => {
    const response = await api.get('/reporting/ventes/kpi/direction', { params });
    return response.data;
};

// =========== 9.4 DASHBOARDS ===========

/**
 * Récupérer le dashboard commercial
 */
export const getDashboardCommercial = async (params = {}) => {
    const response = await api.get('/reporting/ventes/dashboard/commercial', { params });
    return response.data;
};

/**
 * Récupérer le dashboard responsable
 */
export const getDashboardResponsable = async (params = {}) => {
    const response = await api.get('/reporting/ventes/dashboard/responsable', { params });
    return response.data;
};

/**
 * Récupérer le dashboard direction
 */
export const getDashboardDirection = async (params = {}) => {
    const response = await api.get('/reporting/ventes/dashboard/direction', { params });
    return response.data;
};

// =========== 9.5 EXPORTS ===========

/**
 * Preview des ventes pour export
 */
export const getVentesExportPreview = async (params = {}) => {
    const response = await api.get('/reporting/ventes/export/preview', { params });
    return response.data;
};

/**
 * Export ventes en Excel
 */
export const exportVentesExcel = async (params = {}) => {
    const response = await api.get('/reporting/ventes/export/excel', {
        params,
        responseType: 'blob'
    });
    return response;
};

/**
 * Export ventes en CSV
 */
export const exportVentesCsv = async (params = {}) => {
    const response = await api.get('/reporting/ventes/export/csv', {
        params,
        responseType: 'blob'
    });
    return response;
};

/**
 * Export ventes en PDF
 */
export const exportVentesPdf = async (params = {}) => {
    const response = await api.get('/reporting/ventes/export/pdf', {
        params,
        responseType: 'blob'
    });
    return response;
};

/**
 * Export KPI Commercial en Excel
 */
export const exportKpiCommercialExcel = async (params = {}) => {
    const response = await api.get('/reporting/ventes/kpi/commercial/export/excel', {
        params,
        responseType: 'blob'
    });
    return response;
};

/**
 * Export KPI Finance en Excel
 */
export const exportKpiFinanceExcel = async (params = {}) => {
    const response = await api.get('/reporting/ventes/kpi/finance/export/excel', {
        params,
        responseType: 'blob'
    });
    return response;
};

/**
 * Export KPI Direction en Excel
 */
export const exportKpiDirectionExcel = async (params = {}) => {
    const response = await api.get('/reporting/ventes/kpi/direction/export/excel', {
        params,
        responseType: 'blob'
    });
    return response;
};

// =========== HELPER ===========

/**
 * Télécharger un fichier blob
 */
export const downloadFile = (response, filename) => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
