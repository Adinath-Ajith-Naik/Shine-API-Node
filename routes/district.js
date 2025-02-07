const express = require('express');
const router = express.Router();
const districtSchema = require('../models/district.models')
const stateSchema = require('../models/state.models')
const countrySchema = require('../models/country.models')

// Create a new district
router.post('/addDistrict', async (req, res) => {
  try {
    const { districtName, countryId,stateId } = req.body;
    const  isActive  = true;

    const nameExist = await districtSchema.findOne({districtName, stateId, countryId})
    if (nameExist) {
      res.json({ statusCode: 401, message: "District already exist" });
    }
    else {
      const result = await districtSchema.create({ districtName, countryId, stateId,isActive })
      if (result._id) {
        res.json({ statusCode: 200, message:"success", result: { districtId: result._id, districtName, countryId,stateId,isActive } });
      }
      else {
        res.json({ statusCode: 404, message: "District not found" });
      }
    }
  }
  catch (err) {
    console.log(err)
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get all districts
router.get('/districtList', async (req, res) => {
  try {
    let districts = await districtSchema.find({isActive : true});
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
          countryName: country.countryName,
          isActive: element.isActive
        }
        newarr.push(temp);
      }
      console.log(newarr);
      res.json({ statusCode: 200, message:"success", result: { districts: newarr } });
    }
    else {
      res.json({ statusCode: 404, message: "District not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get a single district by ID
router.get('/districtById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const districts = await districtSchema.findOne({ _id: (id) })
    if (districts) {
      res.json({ statusCode: 200, message:"success", result: { districts: districts } });
    }
    else {
      res.json({ statusCode: 404, message: "District not found" });
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
    const { districtName,stateId,countryId } = req.body;
    const districtExist = await districtSchema.findOne({ _id: (id) })
    if (districtExist) {
      const result = await districtSchema.updateOne({ _id: (id) }, { $set: { districtName,stateId,countryId } })
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "District not found" });
      }
      else {
        res.json({ statusCode: 200, message:"success", result: { message: "District details updated" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "District not found" });
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

router.put('/updateDistrict/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { districtName,stateId, countryId } = req.body;

    // Check if the combination already exists, excluding the current state being updated
    const existingDistrict = await stateSchema.findOne({
      districtName,
      stateId,
      countryId,
      _id: { $ne: id }, // Exclude the current state by ID
    });

    if (existingDistrict) {
      return res.json({ statusCode: 400, message: "District with this name already exists!!." });
    }

    // If no duplicate found, update the state
    const updatedDistrict = await stateSchema.findByIdAndUpdate(
      id,
      { $set: { districtName,stateId, countryId } },
      { new: true } // Return the updated document
    );

    if (!updatedDistrict) {
      return res.json({ statusCode: 404, message: "District not found" });
    }

    res.json({ statusCode: 200, result: updatedState, message: "District updated successfully" });

  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
});

// Delete a district by ID
router.put('/deleteDistrict/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = false;
    const districtExist = await districtSchema.findOne({ _id: (id) })
    if (districtExist) {
      const result = await districtSchema.updateOne({ _id: (id) },{$set:{isActive}});
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "District not found" });
      }
      else {
        res.json({ statusCode: 200,message:"success",  result: { message: "District deleted" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "District not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get districts by stateId
router.get('/district/getByState/:stateId', async (req, res, next) => {
  try {
    const { stateId } = req.params;
    let districts = await districtSchema.find({ stateId: stateId , isActive : true });
    if (districts) {
      res.json({ statusCode: 200, message:"success", result: { districts: districts } });
    }
    else {
      res.json({ statusCode: 404, message: "District not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});
  
module.exports = router;