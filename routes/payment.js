const express = require('express');
const router = express.Router();
const paymentSchema = require('../models/payment.models')

// Create a new status

router.post('/addPaymentType', async (req, res) => {
  try {
    const { paymentName } = req.body;
    const  isActive  = true;
    const paymentExist = await paymentSchema.findOne({ paymentName: (paymentName) })
    if (paymentExist) {
      res.json({ statusCode: 401, message: " Payment Type already exist" });
    }
    else {
      const result = await paymentSchema.create({ paymentName, isActive })
      if (result._id) {
        res.json({ statusCode: 200, result: { statusId: result._id, paymentName, isActive } });
      }
      else {
        res.json({ statusCode: 404, message: "Payment Type not found" });
      }
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get all status

router.get('/paymentTypeList', async (req, res) => {
  try {
    let payments = await paymentSchema.find();
    if (payments) {
      res.json({ statusCode: 200, result: { payments: payments } });
    }
    else {
      res.json({ statusCode: 404, message: "Payment Type not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get a single status by ID

router.get('/paymentTypeById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payments = await paymentSchema.findOne({ _id: (id) })
    if (payments) {
      res.json({ statusCode: 200, result: { payments: payments } });
    }
    else {
      res.json({ statusCode: 404, message: "Payment Type not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Update a status by ID

router.put('/updatePaymentType/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentName } = req.body;
    const paymentExist = await paymentSchema.findOne({ _id: (id) })
    if (paymentExist) {
      const result = await paymentSchema.updateOne({ _id: (id) }, { $set: { paymentName } })
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "Payment Type not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Payment Type details updated" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Payment Type not found" });
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Delete a status

router.post('/deletePaymentType/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = false;
    const paymentExist = await paymentSchema.findOne({ _id: (id) })
    if (paymentExist) {
      const result = await paymentSchema.updateOne({ _id: (id) },{ $set: { isActive } });
      if (result.deletedCount === 0) {
        res.json({ statusCode: 404, message: "Payment Type not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Payment Type deleted" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Payment Type not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});



module.exports = router;