const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const climateRoutes = require('./routes/climateRoutes');

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', climateRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
