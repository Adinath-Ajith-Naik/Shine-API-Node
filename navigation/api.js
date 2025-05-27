require('dotenv').config({ path: './.env' })
const express = require('express');
const cors = require('cors');
const expressSanitizer = require('express-sanitizer');


const bodyParser = require('body-parser');

const countryRouter = require('../routes/country');
const stateRouter = require('../routes/state');
const districtRouter = require('../routes/district');
const categoryRouter = require('../routes/category');
const subCategoryRouter = require('../routes/subCategory');
const customerRouter = require('../routes/customer');
const companyRouter = require('../routes/company');
const statusRouter = require('../routes/status');
const paymentRouter = require('../routes/payment');
const imgRouter = require('../image');
const productRouter = require('../routes/products');
const orderRouter = require('../routes/order');


const app = express();
// app.use(cors({
//   origin: '*'
// }));

app.use(cors());
app.use(express.static('public'))
app.use(express.static(__dirname + '/image/'));

app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(expressSanitizer());
require('events').EventEmitter.defaultMaxListeners = 15;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/apiV1', countryRouter);
app.use('/apiV1', stateRouter);
app.use('/apiV1', districtRouter);
app.use('/apiV1', categoryRouter);
app.use('/apiV1', subCategoryRouter);
app.use('/apiV1', customerRouter);
app.use('/apiV1',companyRouter);
app.use('/apiV1',statusRouter);
app.use('/apiV1',paymentRouter);
app.use('/apiv1', imgRouter);
app.use('/apiV1',productRouter);
app.use('/apiV1',orderRouter);




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
