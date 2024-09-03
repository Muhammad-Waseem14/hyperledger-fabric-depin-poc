const express = require('express');
const climateController = require('../controllers/climateController');

const router = express.Router();

router.post('/addClimateRecord', climateController.addClimateRecord);
router.put('/updateClimateRecord/:recordId', climateController.updateClimateRecord);
router.get('/getClimateRecord/:recordId', climateController.getClimateRecord);
router.get('/getAllClimateRecords', climateController.getAllClimateRecords);

module.exports = router;
