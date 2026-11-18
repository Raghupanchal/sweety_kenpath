const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticateToken } = require('../middleware/auth');

// Reports require authentication
router.use(authenticateToken);

router.get('/', reportsController.getReports);

module.exports = router;
