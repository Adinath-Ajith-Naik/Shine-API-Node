const express = require('express');
const router = express.Router();
const districtSchema = require('../models/district.models');
const stateSchema = require('../models/state.models');
const countrySchema = require('../models/country.models');
const companySchema = require('../models/company.models');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create a new Company
router.post('/addCompany', async (req, res) => {
  try {
    const { name,email,contactNo,address, pincode, districtId, stateId, countryId,logoUrl } = req.body;
    const isActive = true;

    // Check if category already exists
    const companyExist = await companySchema.findOne({ name:name });
    if (companyExist) {
      return res.json({ statusCode: 401, message: "Company already exists" });
    }

    // Prepare and save the image if provided
    let savedPhotoUrl = null;
    if (logoUrl) {
      const newId = uuidv4();
      const path = `Images\\Company\\${newId}.jpg`;
      const base64Image = logoUrl.split(';base64,').pop();
      const binaryData = Buffer.from(base64Image, 'base64');

      fs.writeFile(path, binaryData, (err) => {
        if (err) {
          console.error("Error writing image file:", err);
          return res.json({ statusCode: 500, message: "Image upload failed" });
        }
        console.log("Image uploaded successfully:", path);
      });
      savedPhotoUrl = `${newId}.jpg`;
    }

    // Create a new category document
    const newCompany = await companySchema.create({
      name,
      email,
      contactNo,
      address,
      pincode,
      districtId,
      stateId,
      countryId,
      logoUrl: savedPhotoUrl,
      isActive,
    });

    if (newCompany._id) {
      res.json({
        statusCode: 200,
        result: {
          companyId: newCompany._id,
          companyname: newCompany.name,
          contactNo: newCompany.contactNo,
          email: newCompany.email,
          address: newCompany.address,
          pincode: newCompany.pincode,
          districtId: newCompany.districtId,
          stateId: newCompany.stateId,
          countryId : newCompany.countryId,
          logoUrl: newCompany.logoUrl,
          isActive: newCompany.isActive,
        },
      });
    } else {
      res.json({ statusCode: 404, message: "Failed to add company" });
    }
  } catch (err) {
    res.json({ statusCode: 400, message: err.message });
  }
});

// Get all Companies
router.get('/companyList', async (req, res) => {
  try {
    let companies = await companySchema.find({isActive : true});
    if (companies) {
      let newarr = [];
      for (const element of companies) {
        let country = await countrySchema.findOne({ _id: element.countryId });
        let state = await stateSchema.findOne({ _id: element.stateId });
        let district = await districtSchema.findOne({_id: element.districtId});
        let temp = {
          _id: element._id,
          countryId : element.countryId,
          stateId : element.stateId,
          districtId : element.districtId,
          districtName: district.districtName,
          stateName: state.stateName,
          countryName: country.countryName,
          name : element.name,
          email : element.email,
          contactNo : element.contactNo,
          address : element.address,
          pincode : element.pincode,
          logoUrl : element.logoUrl,
          isActive: element.isActive
        }
        newarr.push(temp);
      }
      console.log(newarr);
      res.json({ statusCode: 200, message:"success", result: { companies: newarr } });
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
      // let newarr = [];
      let country = await countrySchema.findOne({ _id: companies.countryId });
      let state = await stateSchema.findOne({ _id: companies.stateId });
      let district = await districtSchema.findOne({_id: companies.districtId});
      let temp = {
        _id: companies._id,
        countryId : companies.countryId,
        stateId : companies.stateId,
        districtId : companies.districtId,
        districtName: district.districtName,
        stateName: state.stateName,
        countryName: country.countryName,
        name : companies.name,
        email : companies.email,
        contactNo : companies.contactNo,
        address : companies.address,
        pincode : companies.pincode,
        logoUrl : companies.logoUrl,
        isActive: companies.isActive
      }
      // newarr.push(temp);
      
      // console.log(newarr);
      res.json({ statusCode: 200, result: { companies: temp } });
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
router.put('/updateCompany/:id', async (req, res) => {
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
router.put('/deleteCompany/:id', async (req, res) => {
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