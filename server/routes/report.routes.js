const express = require('express');
const router = express.Router();
const {
  generateReport,
  exportReportCsv,
  getReportCatalog
} = require('../controllers/report.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// All report routes require authentication and Faculty or Admin privileges
router.use(protect);
router.use(authorizeRoles('Admin', 'Faculty'));

router.get('/catalog', getReportCatalog);
router.get('/generate', generateReport);
router.get('/export/csv', exportReportCsv);

module.exports = router;
