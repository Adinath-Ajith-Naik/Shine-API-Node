const express = require('express');
const router = express.Router();
const countrySchema = require('../models/country.models')

// Create a new country
router.post('/country', async (req, res) => {
  try {
    const { countryName } = req.body;
    const countryExist = await countrySchema.findOne({ countryName: (countryName) })
    if (countryExist) {
      res.json({ statusCode: 401, message: "item already exist" });
    }
    else {
      const result = await countrySchema.create({ countryName })
      if (result._id) {
        res.json({ statusCode: 200, result: { countryid: result._id, countryName } });
      }
      else {
        res.json({ statusCode: 404, message: "item not found" });
      }
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});


// Get all countries
router.get('/country', async (req, res) => {
  try {
    let countries = await countrySchema.find();
    if (countries) {
      res.json({ statusCode: 200, result: { countries: countries } });
    }
    else {
      res.json({ statusCode: 404, message: "item not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get all countries with limit

router.get('/country_home', async (req, res) => {
  try {
    let countries = await countrySchema.find().sort({_id:-1}).limit(2);
    if (countries) {
      res.json({ statusCode: 200, result: { countries: countries } });
    }
    else {
      res.json({ statusCode: 404, message: "item not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get a single country by ID
router.get('/country/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const countries = await countrySchema.findOne({ _id: (id) })
    if (countries) {
      res.json({ statusCode: 200, result: { countries: countries } });
    }
    else {
      res.json({ statusCode: 404, message: "item not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Update a country by ID
router.put('/country/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { countryName } = req.body;
    const countryExist = await countrySchema.findOne({ _id: (id) })
    if (countryExist) {
      const result = await countrySchema.updateOne({ _id: (id) }, { $set: { countryName } })
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "item not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "details updated" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "item not found" });
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Delete a country by ID
router.delete('/country/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const countryExist = await countrySchema.findOne({ _id: (id) })
    if (countryExist) {
      const result = await countrySchema.deleteOne({ _id: (id) });
      if (result.deletedCount === 0) {
        res.json({ statusCode: 404, message: "item not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "item deleted" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "item not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

module.exports = router;