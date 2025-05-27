const express = require('express');
const router = express.Router();
const categorySchema = require('../models/category.models')
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Category Add
router.post('/addCategory', async (req, res) => {
  try {
    const { categoryName, photoUrl } = req.body;
    const isActive = true;

    // Check if category already exists
    const categoryExist = await categorySchema.findOne({ categoryName:categoryName });
    if (categoryExist) {
      return res.json({ statusCode: 401, message: "Category already exists" });
    }

    // Prepare and save the image if provided
    let savedPhotoUrl = null;
    if (photoUrl) {
      const newId = uuidv4();
      const path = `public/image/${newId}.jpg`;
      const base64Image = photoUrl.split(';base64,').pop();
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
    const newCategory = await categorySchema.create({
      categoryName,
      photoUrl: savedPhotoUrl,
      isActive,
    });

    if (newCategory._id) {
      res.json({
        statusCode: 200,
        result: {
          categoryId: newCategory._id,
          categoryName: newCategory.categoryName,
          photoUrl: newCategory.photoUrl,
          isActive: newCategory.isActive,
        },
      });
    } else {
      res.json({ statusCode: 404, message: "Failed to add category" });
    }
  } catch (err) {
    res.json({ statusCode: 400, message: err.message });
  }
});

// Get all Categories
router.get('/categoryList', async (req, res) => {
  try {
    let categories = await categorySchema.find({isActive : true});
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

// Image by ID
router.get('/categoryImage/:filename', async (req, res) => {
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
router.put('/updateCategory/:id', async (req, res) => {
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
router.put('/deleteCategory/:id', async (req, res) => {
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

router.get('/paginatedCategories', async (req, res) => {
  try {
      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Filtering parameters
      const nameFilter = req.query.name || '';
  
      // Build filter query
      let filterQuery = { isActive: true };

      if (nameFilter) {
          filterQuery.categoryName = { $regex: nameFilter, $options: 'i' };
      }
    

      // Get total count for pagination
      const totalCategories = await categorySchema.countDocuments(filterQuery);

      // Fetch paginated products
      let categories = await categorySchema
          .find(filterQuery)
          .skip(skip)
          .limit(limit);

      // Enrich product data with category, subcategory, and company details

        let newarr = [];
      if (categories && categories.length > 0) {
        for (const element of categories) {
            
            
            let temp = {
                _id: element._id,
                categoryName: element.categoryName,
                photoUrl: element.photoUrl,
                isActive: element.isActive
            }
            newarr.push(temp);
        }
  
      }
      
      // Calculate total pages
      const totalPages = Math.ceil(totalCategories / limit);

      res.json({ 
          statusCode: 200, 
          message: "success", 
          result: { 
              categories: newarr,
              pagination: {
                totalCategories, 
                  currentPage: page,
                  totalPages: totalPages,
                  totalCategories: totalCategories,
                  pageSize: limit
              }
          } 
      });
  }
  catch (err) {
      res.json({ statusCode: 400, message: err.message })
  }
});



// Create Category (old Method)
router.post('/saveCategory', async (req, res) => {
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


module.exports = router;