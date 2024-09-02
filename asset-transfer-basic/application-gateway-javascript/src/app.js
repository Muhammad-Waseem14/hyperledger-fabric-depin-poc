const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const climateController = require('./controllers/climateController');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/addClimateRecord', climateController.addClimateRecord);
app.put('/updateClimateRecord/:recordId', climateController.updateClimateRecord);
app.get('/getClimateRecord/:recordId', climateController.getClimateRecord);
app.get('/getAllClimateRecords', climateController.getAllClimateRecords);

module.exports = app;
