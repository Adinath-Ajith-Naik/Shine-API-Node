const express = require('express');
const router = express.Router();
const categorySchema = require('../models/category.models')
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create a new Category
router.post('/addCategory', async (req, res) => {
  var addData = new categorySchema({
    categoryName : req.body.categoryName,
    photoUrl : req.body.photoUrl,
    isActive : true,
  });

  if(req.body.photoUrl != null && req.body.photoUrl != ""){
    const newId = uuidv4();
    const path = `Images\\Category\\${newId}.jpg`
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
      // res.json({statusCode:200, message:"Success"})
      console.log("Category Added");
});

// Get all Categories
router.get('/categoryList', async (req, res) => {
  try {
    let categories = await categorySchema.find();
    if (categories) {
      res.json({ statusCode: 200, result: { categories: categories } });
    }
    else {
      res.json({ statusCode: 404, message: "Category not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get a category by ID
router.get('/categoryById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await categorySchema.findOne({ _id: (id) })
    if (categories) {
      res.json({ statusCode: 200, result: { categories: categories } });
    }
    else {
      res.json({ statusCode: 404, message: "Category not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Update a category by ID
router.put('/category/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName} = req.body;
    const photoUrl = req.body.photoUrl;
    let new_image;
    const categoryExist = await categorySchema.findOne({ _id: (id) })
    if (categoryExist) {

      if(req.body.photoUrl != null && req.body.photoUrl != ""){
        const newId = uuidv4();
        const path = `Images\\Category\\${newId}.jpg`
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
      const result = await categorySchema.updateMany({ _id: (id) }, { $set: {categoryName: categoryName, photoUrl: new_image}});
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "Category not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Category Details Updated" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Category not found" });
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Delete a category by ID
router.get('/deleteCategory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = false;
    const categoryExist = await categorySchema.findOne({ _id: (id) })
    if (categoryExist) {
      const result = await categorySchema.updateOne({ _id: (id) }, {$set:{isActive}});
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "Category not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Category deleted" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Category not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});


module.exports = router;