const express = require('express');
const router = express.Router();
const districtSchema = require('../models/district.models')
const stateSchema = require('../models/state.models')
const countrySchema = require('../models/country.models')


// Create a new district
router.post('/district', async (req, res) => {
  try {
    const { districtName, countryId,stateId } = req.body;
    const nameExist = await districtSchema.findOne({ districtName: (districtName) })
    if (nameExist) {
      res.json({ statusCode: 401, message: "item already exist" });
    }
    else {
      const result = await districtSchema.create({ districtName, countryId, stateId })
      if (result._id) {
        res.json({ statusCode: 200, message:"success", result: { districtId: result._id, districtName, countryId,stateId } });
      }
      else {
        res.json({ statusCode: 404, message: "item not found" });
      }
    }
  }
  catch (err) {
    console.log(err)
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get all districts
router.get('/district', async (req, res) => {
  try {
    let districts = await districtSchema.find();
    if (districts) {
      let newarr = [];
      for (const element of districts) {
        let country = await countrySchema.findOne({ _id: element.countryId });
        let state = await stateSchema.findOne({ _id: element.stateId });
        let temp = {
          _id: element._id,
          countryId : element.countryId,
          stateId : element.stateId,
          districtName: element.districtName,
          stateName: state.stateName,
          countryName: country.countryName
        }
        newarr.push(temp);
      }
      console.log(newarr);
      res.json({ statusCode: 200, message:"success", result: { districts: newarr } });
    }
    else {
      res.json({ statusCode: 404, message: "item not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get a single district by ID
router.get('/district/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const districts = await districtSchema.findOne({ _id: (id) })
    if (districts) {
      res.json({ statusCode: 200, message:"success", result: { districts: districts } });
    }
    else {
      res.json({ statusCode: 404, message: "item not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});


// Update a district by ID
router.put('/district/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { districtName } = req.body;
    const districtExist = await districtSchema.findOne({ _id: (id) })
    if (districtExist) {
      const result = await districtSchema.updateOne({ _id: (id) }, { $set: { districtName } })
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "item not found" });
      }
      else {
        res.json({ statusCode: 200, message:"success", result: { message: "details updated" } });
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


// Delete a district by ID
router.delete('/district/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const districtExist = await districtSchema.findOne({ _id: (id) })
    if (districtExist) {
      const result = await districtSchema.deleteOne({ _id: (id) });
      if (result.deletedCount === 0) {
        res.json({ statusCode: 404, message: "item not found" });
      }
      else {
        res.json({ statusCode: 200,message:"success",  result: { message: "item deleted" } });
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

// Get districts by stateId
router.get('/district/getDistrictByState/:stateId', async (req, res, next) => {
  try {
    const { stateId } = req.params;
    let districts = await districtSchema.find({ stateId: stateId });
    if (districts) {
      res.json({ statusCode: 200, message:"success", result: { districts: districts } });
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