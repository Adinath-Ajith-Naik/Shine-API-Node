const express = require('express');
const router = express.Router();
const subCategorySchema = require('../models/subcategory.models')
const categorySchema = require('../models/category.models')
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create a new subcategory
router.post('/addSubCategory', async (req, res) => {
    var addData = new subCategorySchema({
      subCategoryName : req.body.subCategoryName,
      photoUrl : req.body.photoUrl,
      categoryId : req.body.categoryId,
      isActive : true,
    });
  
    if(req.body.photoUrl != null && req.body.photoUrl != ""){
      const newId = uuidv4();
      const path = `Images\\SubCategory\\${newId}.jpg`
      // const path = `img.jpg`
      const base64Data = req.body.photoUrl;
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
      addData.photoUrl =`${newId}.jpg`;
    }
  
      const addDataToSave = addData.save();
        res.status(200).json(addDataToSave);
        console.log("SubCategory Added");
  });
  
  // Get all Sub Categories
  router.get('/subCategoryList', async (req, res) => {
    try {
      let subCategories = await subCategorySchema.find();
      if (subCategories) {
        res.json({ statusCode: 200, result: { subCategories: subCategories } });
      }
      else {
        res.json({ statusCode: 404, message: "Sub Category not found" });
      }
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
  });
  
  // Get a Sub Category by ID
  router.get('/subCategoryById/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const subCategories = await subCategorySchema.findOne({ _id: (id) })
      if (subCategories) {
        res.json({ statusCode: 200, result: { subCategories: subCategories } });
      }
      else {
        res.json({ statusCode: 404, message: "Sub Category not found" });
      }
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
  });

    // Get a Sub Category by Category ID
    router.get('/subCategory/getByCategory/:categoryId', async (req, res) => {
        try {
          const { categoryId } = req.params;
          const subCategories = await subCategorySchema.find({ categoryId: (categoryId) })
          if (subCategories) {
            res.json({ statusCode: 200, result: { subCategories: subCategories } });
          }
          else {
            res.json({ statusCode: 404, message: "Sub Categories not found" });
          }
        }
        catch (err) {
          res.json({ statusCode: 400, message: err.message })
        }
      });
  
  // Update a category by ID
  router.put('/subCategory/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { subCategoryName, categoryId} = req.body;
      const photoUrl = req.body.photoUrl;
      let new_image;
      const subCategoryExist = await subCategorySchema.findOne({ _id: (id) })
      if (subCategoryExist) {
  
        if(req.body.photoUrl != null && req.body.photoUrl != ""){
          const newId = uuidv4();
          const path = `Images\\SubCategory\\${newId}.jpg`
          // const path = `img.jpg`
          const base64Data = req.body.photoUrl;
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
        const result = await subCategorySchema.updateMany({ _id: (id) }, { $set: {subCategoryName: subCategoryName, photoUrl: new_image, categoryId:categoryId}});
        if (result.modifiedCount === 0) {
          res.json({ statusCode: 404, message: "Sub Category not found" });
        }
        else {
          res.json({ statusCode: 200, result: { message: "Sub Category Details Updated" } });
        }
      }
      else {
        res.json({ statusCode: 404, message: "Sub Category not found" });
      }
  
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
  });
  
  // Delete a subcategory by ID
  router.get('/deleteSubCategory/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const isActive = false;
      const subCategoryExist = await subCategorySchema.findOne({ _id: (id) })
      if (subCategoryExist) {
        const result = await subCategorySchema.updateOne({ _id: (id) },{$set:{isActive}});
        if (result.modifiedCount === 0) {
          res.json({ statusCode: 404, message: "Sub Category not found" });
        }
        else {
          res.json({ statusCode: 200, result: { message: "Sub Category deleted" } });
        }
      }
      else {
        res.json({ statusCode: 404, message: "Sub Category not found" });
      }
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
  });
  
  
  module.exports = router;