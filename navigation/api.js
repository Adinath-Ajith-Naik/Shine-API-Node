require('dotenv').config({ path: './.env' })
const express = require('express');
const cors = require('cors');
const expressSanitizer = require('express-sanitizer');

const countryRouter = require('../routes/country');
const stateRouter = require('../routes/state');
const districtRouter = require('../routes/district');
const categoryRouter = require('../routes/category');
const subCategoryRouter = require('../routes/subCategory');


const app = express();
app.use(cors({
  origin: '*'
}));

app.use(expressSanitizer());
require('events').EventEmitter.defaultMaxListeners = 15;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/apiV1', countryRouter);
app.use('/apiV1', stateRouter);
app.use('/apiV1', districtRouter);
app.use('/apiV1', categoryRouter);
app.use('/apiV1', subCategoryRouter);


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = {}
  res.status(err.status || 500);
  console.log(err)
  res.status(500).send({ response: { status: "error", message: "Invalid request parameters or method" } })
});

module.exports = app;
