const express = require('express');
const router = express.Router();
const stateSchema = require('../models/state.models')
const countrySchema = require('../models/country.models')

// Create a new state
router.post('/addState', async (req, res) => {
  try {
    const { stateName, countryId } = req.body;
    const isActive = true;
    // Check if the state exists
    console.log("Before Entering")
    const stateExist = await stateSchema.findOne({ stateName, countryId });

    if (stateExist) {
      return res.json({ statusCode: 409, message: "State name already exists for this country" });
    }else{
      const result = await stateSchema.create({ stateName, countryId,isActive })
      if (result._id) {
        res.json({ statusCode: 200, result: { stateId: result._id, stateName, countryId,isActive } });
      }
      else {
        res.json({ statusCode: 404, message: "State not found" });
      }
    }
  } catch (err) {
    res.json({ statusCode: 400, message: err.message });
  }
});

// Get all states
router.get('/stateList', async (req, res) => {
  try {
    let states = await stateSchema.find({isActive : true});
    if (states) {
      let newarr = [];
      for (const element of states) {
        let country = await countrySchema.findOne({ _id: element.countryId });
        let temp = {
          _id: element._id,
          countryId : element.countryId,
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
router.get('/stateById/:id', async (req, res) => {
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
router.put('/updateState/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stateName,countryId } = req.body;
    const stateExist = await stateSchema.find({ _id: (id) })
    
    if (stateExist) {

      const duplicateState = await stateSchema.findOne({ stateName, countryId });

      if (duplicateState) {
        return res.json({ statusCode: 409, message: "State name already exists for this country (DUPLICATE STATE) ------ CONDITION 1" });
      }

      const result = await stateSchema.updateOne({ _id: (id) }, { $set: { stateName,countryId } })
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "State not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "State details updated" } });
      }
      
    }
    else {
      res.json({ statusCode: 404, message: "State not found" });
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

router.put('/UpdState/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stateName, countryId } = req.body;

    // Check if the state exists
    const stateExist = await stateSchema.findOne({ _id: id });

    if (!stateExist) {
      return res.json({ statusCode: 404, message: "State not found" });
    }

    // Condition 1: If the stateName already exists in the given countryId, do not update
    const duplicateState = await stateSchema.findOne({ stateName, countryId });

    if (duplicateState) {
      return res.json({ statusCode: 409, message: "State name already exists for this country (DUPLICATE STATE) ------ CONDITION 1" });
    }

    // Condition 2: If stateName does not exist under the given countryId, update it
    if (stateExist.countryId === countryId) {
      const result = await stateSchema.updateOne({ _id: id }, { $set: { stateName } });

      if (result.modifiedCount === 0) {
        return res.json({ statusCode: 304, message: "No changes made to the state" });
      }

      return res.json({ statusCode: 200, result: { message: "State details updated successfully ---- CONDITION 2" } });
    }

    // Condition 3: If countryId of the state is changed, verify stateName with new countryId
    const newCountryStateExist = await stateSchema.findOne({ stateName, countryId });

    if (newCountryStateExist) {
      return res.json({ statusCode: 409, message: "State name already exists in the new country ---- CONDITION 3" });
    }

    // Update both stateName and countryId if stateName does not exist in the new country
    const result = await stateSchema.updateOne({ _id: id }, { $set: { stateName, countryId } });

    if (result.modifiedCount === 0) {
      return res.json({ statusCode: 304, message: "No changes made to the state" });
    }

    return res.json({ statusCode: 200, result: { message: "State details updated successfully --- CONDITION 3" } });

  } catch (err) {
    res.json({ statusCode: 400, message: err.message });
  }
});

router.put('/US/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stateName, countryId } = req.body;

    // Check if the combination already exists, excluding the current state being updated
    const existingState = await stateSchema.findOne({
      stateName,
      countryId,
      _id: { $ne: id }, // Exclude the current state by ID
    });

    if (existingState) {
      return res.status(400).json({ statusCode: 400, message: "State with this name already exists in the country." });
    }

    // If no duplicate found, update the state
    const updatedState = await stateSchema.findByIdAndUpdate(
      id,
      { $set: { stateName, countryId } },
      { new: true } // Return the updated document
    );

    if (!updatedState) {
      return res.status(404).json({ statusCode: 404, message: "State not found" });
    }

    res.json({ statusCode: 200, result: updatedState, message: "State updated successfully" });

  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
});



// Delete state 
router.put('/deleteState/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = false;
    const stateExist = await stateSchema.findOne({ _id: (id) })
    if (stateExist) {
      const result = await stateSchema.updateOne({ _id: (id) }, { $set: { isActive } })
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "State not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "State Deleted" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "State not found" });
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get state by country
router.get('/state/getByCountry/:countryId', async (req, res, next) => {
  try {
    const { countryId } = req.params;
    let states = await stateSchema.find({ countryId: countryId , isActive:true});
    if (states.length > 0) {
      res.json({ statusCode: 200, result: { states: states } });
    }
    else {
      res.json({ statusCode: 404, message: "No states found!!!" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
})

module.exports = router;