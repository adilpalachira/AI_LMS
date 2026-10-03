const reportService = require('../services/report.service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Generate structured report dataset
 * GET /api/reports/generate?type=STUDENT_PERFORMANCE&courseId=xxx&timeframe=30d
 */
const generateReport = async (req, res, next) => {
  try {
    const reportType = req.query.type || 'STUDENT_PERFORMANCE';
    const filters = {
      courseId: req.query.courseId,
      riskLevel: req.query.riskLevel,
      status: req.query.status,
      quizId: req.query.quizId,
      timeframe: req.query.timeframe || '30d',
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const report = await reportService.generateReport(reportType, filters, req.user);
    return successResponse(res, 'Report generated successfully', report);
  } catch (error) {
    next(error);
  }
};

/**
 * Export report as CSV download
 * GET /api/reports/export/csv?type=STUDENT_PERFORMANCE&courseId=xxx
 */
const exportReportCsv = async (req, res, next) => {
  try {
    const reportType = req.query.type || 'STUDENT_PERFORMANCE';
    const filters = {
      courseId: req.query.courseId,
      riskLevel: req.query.riskLevel,
      status: req.query.status,
      quizId: req.query.quizId,
      timeframe: req.query.timeframe || 'all',
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const report = await reportService.generateReport(reportType, filters, req.user);
    const csvData = reportService.convertReportToCsv(report);

    const filename = `${reportType.toLowerCase()}_report_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

/**
 * Get available report definitions & catalog
 * GET /api/reports/catalog
 */
const getReportCatalog = async (req, res, next) => {
  try {
    const accessible = reportService.getReportCatalog(req.user);
    return successResponse(res, 'Report catalog retrieved successfully', accessible);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateReport,
  exportReportCsv,
  getReportCatalog
};
