const express = require('express');
const router = express.Router();
const studyPlanController = require('../controllers/studyPlan.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

// All routes require authentication (Student primary)
router.use(protect);

router.post('/', studyPlanController.createStudyPlan);
router.get('/', studyPlanController.getStudyPlans);
router.get('/:id', studyPlanController.getStudyPlanById);
router.delete('/:id', studyPlanController.deleteStudyPlan);

// Task Action Endpoints
router.patch('/tasks/:id/complete', studyPlanController.completeTask);
router.patch('/tasks/:id/status', studyPlanController.updateTaskStatus);
router.patch('/tasks/:id/reschedule', studyPlanController.rescheduleTask);
router.patch('/tasks/:id/skip', studyPlanController.skipTask);

module.exports = router;
