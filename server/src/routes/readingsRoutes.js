const express = require('express');
const router = express.Router();
const readingsController = require('../controllers/readingsController');
const { authenticateToken } = require('../middleware/auth');
const { validateReading } = require('../middleware/validateReading');

// All reading routes require authentication
router.use(authenticateToken);

router.get('/', readingsController.getReadings);
router.post('/', validateReading, readingsController.createReading);
router.get('/:id', readingsController.getReadingById);
router.put('/:id', validateReading, readingsController.updateReading);
router.delete('/:id', readingsController.deleteReading);

module.exports = router;
