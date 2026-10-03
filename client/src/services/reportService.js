import api from './api';

export const reportService = {
  /**
   * Get available report types and descriptions
   */
  getReportCatalog: async () => {
    const response = await api.get('/reports/catalog');
    return response.data;
  },

  /**
   * Generate structured report dataset
   * @param {string} reportType 
   * @param {object} filters 
   */
  generateReport: async (reportType, filters = {}) => {
    const params = {
      type: reportType,
      ...filters
    };
    const response = await api.get('/reports/generate', { params });
    return response.data;
  },

  /**
   * Download report as CSV file
   * @param {string} reportType 
   * @param {object} filters 
   */
  exportReportCsv: async (reportType, filters = {}) => {
    const params = {
      type: reportType,
      ...filters
    };
    const response = await api.get('/reports/export/csv', {
      params,
      responseType: 'blob'
    });

    // Create browser download link for CSV blob
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType.toLowerCase()}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  }
};

export default reportService;
