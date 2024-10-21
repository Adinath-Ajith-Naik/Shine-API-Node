const express = require('express');
const router = express.Router();
const stateSchema = require('../models/state.models')
const countrySchema = require('../models/country.models')

// Create a new state
router.post('/state', async (req, res) => {
  try {
    const { stateName, countryId } = req.body;
    const  isActive  = true;

    const stateExist = await stateSchema.findOne({ stateName: (stateName) })
    if (stateExist) {
      res.json({ statusCode: 401, message: "State already exist" });
    }
    else {
      const result = await stateSchema.create({ stateName, countryId,isActive })
      if (result._id) {
        res.json({ statusCode: 200, result: { stateId: result._id, stateName, countryId,isActive } });
      }
      else {
        res.json({ statusCode: 404, message: "State not found" });
      }
    }
  }
  catch (err) {
    console.log(err)
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get all states

router.get('/state', async (req, res) => {
  try {
    let states = await stateSchema.find();
    if (states) {
      let newarr = [];
      for (const element of states) {
        let country = await countrySchema.findOne({ _id: element.countryId });
        let temp = {
          _id: element._id,
          // countryId : element.countryId,
          stateName: element.stateName,
          countryName: country.countryName,
          isActive:element.isActive
        }
        newarr.push(temp);
      }
      console.log(newarr);
      res.json({ statusCode: 200, result: { states: newarr } });
    }
    else {
      res.json({ statusCode: 404, message: "item not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get a single state by ID

router.get('/state/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const states = await stateSchema.findOne({ _id: (id) })
    if (states) {
      res.json({ statusCode: 200, result: { states: states } });
    }
    else {
      res.json({ statusCode: 404, message: "State not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});


// Update a state by ID
router.put('/state/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stateName } = req.body;
    const stateExist = await stateSchema.findOne({ _id: (id) })
    if (stateExist) {
      const result = await stateSchema.updateOne({ _id: (id) }, { $set: { stateName } })
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


// Delete a state by ID

router.delete('/state/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const stateExist = await stateSchema.findOne({ _id: (id) })
    if (stateExist) {
      const result = await stateSchema.deleteOne({ _id: (id) });
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

// Get states by district

router.get('/state/getSateteByCountry/:countryId', async (req, res, next) => {
  try {
    const { countryId } = req.params;
    let states = await stateSchema.find({ countryId: countryId });
    if (states) {
      res.json({ statusCode: 200, result: { states: states } });
    }
    else {
      res.json({ statusCode: 404, message: "item not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
})

module.exports = router;