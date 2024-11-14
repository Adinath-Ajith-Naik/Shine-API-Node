const express = require('express');
const router = express.Router();
const statusSchema = require('../models/status.models')

// Create a new status

router.post('/addStatus', async (req, res) => {
  try {
    const { statusName } = req.body;
    const  isActive  = true;
    const statusExist = await statusSchema.findOne({ statusName: (statusName) })
    if (statusExist) {
      res.json({ statusCode: 401, message: " Status already exist" });
    }
    else {
      const result = await statusSchema.create({ statusName, isActive })
      if (result._id) {
        res.json({ statusCode: 200, result: { statusId: result._id, statusName, isActive } });
      }
      else {
        res.json({ statusCode: 404, message: "Status not found" });
      }
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get all status

router.get('/statusList', async (req, res) => {
  try {
    let statuses = await statusSchema.find();
    if (statuses) {
      res.json({ statusCode: 200, result: { statuses: statuses } });
    }
    else {
      res.json({ statusCode: 404, message: "Status not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get a single status by ID

router.get('/statusById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const statuses = await statusSchema.findOne({ _id: (id) })
    if (statuses) {
      res.json({ statusCode: 200, result: { statuses: statuses } });
    }
    else {
      res.json({ statusCode: 404, message: "Status not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Update a status by ID

router.put('/updateStatus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { statusName } = req.body;
    const statusExist = await statusSchema.findOne({ _id: (id) })
    if (statusExist) {
      const result = await statusSchema.updateOne({ _id: (id) }, { $set: { statusName } })
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "Status not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Status details updated" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Status not found" });
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Delete a status

router.get('/deleteStatus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = false;
    const statusExist = await statusSchema.findOne({ _id: (id) })
    if (statusExist) {
      const result = await statusSchema.updateOne({ _id: (id) },{ $set: { isActive } });
      if (result.deletedCount === 0) {
        res.json({ statusCode: 404, message: "Status not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Status deleted" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Status not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});



module.exports = router;