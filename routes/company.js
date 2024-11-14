const express = require('express');
const router = express.Router();
const districtSchema = require('../models/district.models');
const stateSchema = require('../models/state.models');
const countrySchema = require('../models/country.models');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create a new Company
router.post('/addCompany', async (req, res) => {
  var addData = new companySchema({
    name : req.body.name,
    email : req.body.email,
    contactNo : req.body.contactNo,
    address : req.body.address,
    pincode : req.body.pincode,
    districtId : req.body.districtId,
    stateId : req.body.stateId,
    countryId : req.body.countryId,
    logoUrl : req.body.logoUrl,
    isActive : true,
  });

  if(req.body.logoUrl != null && req.body.logoUrl != ""){
    const newId = uuidv4();
    const path = `Images\\Company\\${newId}.jpg`
    // const path = `img.jpg`
    const base64Data = req.body.logoUrl;
    let base64Image = base64Data.split(';base64,').pop();
    const BinaryData = Buffer.from(base64Image,'base64');
    console.log(BinaryData);
    fs.writeFile(path, BinaryData, (err) => {
      // console.log("Image Uploaded");
      if(err){
        console.error("Error writing in file",err);
      }
      else{
        console.log("Base64 converted",path);
      }
    });
    // addData.image = path;
    addData.logoUrl =`${newId}.jpg`;
  }

    const addDataToSave = addData.save();
      res.status(200).json(addDataToSave);
      console.log("Company Added");
});

// Get all Companies

router.get('/companyList', async (req, res) => {
  try {
    let companies = await companySchema.find();
    if (companies) {
      res.json({ statusCode: 200, result: { companies: companies } });
    }
    else {
      res.json({ statusCode: 404, message: "Company not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get a company by ID

router.get('/companyById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const companies = await companySchema.findOne({ _id: (id) })
    if (companies) {
      res.json({ statusCode: 200, result: { companies: companies } });
    }
    else {
      res.json({ statusCode: 404, message: "Company not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Update a company by ID

router.put('/company/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, contactNo, address, pincode, districtId, stateId, countryId} = req.body;
    const photoUrl = req.body.logoUrl;
    let new_image;
    const companyExist = await companySchema.findOne({ _id: (id) })
    if (companyExist) {

      if(req.body.logoUrl != null && req.body.logoUrl != ""){
        const newId = uuidv4();
        const path = `Images\\Company\\${newId}.jpg`
        // const path = `img.jpg`
        const base64Data = req.body.logoUrl;
        let base64Image = base64Data.split(';base64,').pop();
        const BinaryData = Buffer.from(base64Image,'base64');
        console.log(BinaryData);
        fs.writeFile(path, BinaryData, (err) => {
          // console.log("Image Uploaded");
          if(err){
            console.error("Error writing in file",err);
          }
          else{
            console.log("Base64 converted",path);
          }
        });
        // addData.image = path;
        new_image =`${newId}.jpg`;
      }
      const result = await companySchema.updateMany({ _id: (id) }, { $set: {name: name, email: email, contactNo:contactNo, address: address, pincode: pincode, districtId: districtId, stateId: stateId, countryId: countryId, logoUrl: new_image}});
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "Company not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Company Details Updated" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Company not found" });
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Delete a company by ID

router.get('/deleteCompany/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = false;
    const companyExist = await companySchema.findOne({ _id: (id) })
    if (companyExist) {
      const result = await companySchema.updateOne({ _id: (id) }, {$set:{isActive}});
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "Company not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Company deleted" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Company not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});


module.exports = router;