const express = require('express');
const router = express.Router();
const subCategorySchema = require('../models/subCategory.models');
const categorySchema = require('../models/category.models');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create a new subcategory
router.post('/addSubCategory', async (req, res) => {
  try {
    const { subCategoryName, photoUrl, categoryId } = req.body;
    const isActive = true;

    // Check if category already exists
    const subCategoryExist = await subCategorySchema.findOne({ subCategoryName: subCategoryName });
    if (subCategoryExist) {
      return res.json({ statusCode: 401, message: "Category already exists" });
    }

    // Prepare and save the image if provided
    let savedPhotoUrl = null;
    if (photoUrl) {
      const newId = uuidv4();
      const path = `Images\\SubCategory\\${newId}.jpg`;
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
    const newSubCategory = await subCategorySchema.create({
      subCategoryName,
      categoryId,
      photoUrl: savedPhotoUrl,
      isActive,
    });

    if (newSubCategory._id) {
      res.json({
        statusCode: 200,
        result: {
          subCategoryId: newSubCategory._id,
          subCategoryName: newSubCategory.subCategoryName,
          categoryId: newSubCategory.categoryId,
          photoUrl: newSubCategory.photoUrl,
          isActive: newSubCategory.isActive,
        },
      });
    } else {
      res.json({ statusCode: 404, message: "Failed to add category" });
    }
  } catch (err) {
    res.json({ statusCode: 400, message: err.message });
  }
});

// Get all Sub Categories
router.get('/subCategoryList', async (req, res) => {
  try {
    let subcategories = await subCategorySchema.find({ isActive: true });
    if (subcategories) {
      let newarr = [];
      for (const element of subcategories) {
        let category = await categorySchema.findOne({ _id: element.categoryId });
        let temp = {
          _id: element._id,
          categoryId: element.categoryId,
          subCategoryName: element.subCategoryName,
          categoryName: category.categoryName,
          isActive: element.isActive,
          photoUrl: element.photoUrl
        }
        newarr.push(temp);
      }
      console.log(newarr);
      res.json({ statusCode: 200, result: { subcategories: newarr } });
    }
    else {
      res.json({ statusCode: 404, message: "item not found" });
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
    const { subCategoryName, categoryId } = req.body;
    const photoUrl = req.body.photoUrl;
    let new_image;
    const subCategoryExist = await subCategorySchema.findOne({ _id: (id) })
    if (subCategoryExist) {

      if (req.body.photoUrl != null && req.body.photoUrl != "") {
        const newId = uuidv4();
        const path = `Images\\SubCategory\\${newId}.jpg`
        // const path = `img.jpg`
        const base64Data = req.body.photoUrl;
        let base64Image = base64Data.split(';base64,').pop();
        const BinaryData = Buffer.from(base64Image, 'base64');
        console.log(BinaryData);
        fs.writeFile(path, BinaryData, (err) => {
          // console.log("Image Uploaded");
          if (err) {
            console.error("Error writing in file", err);
          }
          else {
            console.log("Base64 converted", path);
          }
        });
        // addData.image = path;
        new_image = `${newId}.jpg`;
      }
      const result = await subCategorySchema.updateMany({ _id: (id) }, { $set: { subCategoryName: subCategoryName, photoUrl: new_image, categoryId: categoryId } });
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
router.put('/deleteSubCategory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = false;
    const subCategoryExist = await subCategorySchema.findOne({ _id: (id) })
    if (subCategoryExist) {
      const result = await subCategorySchema.updateOne({ _id: (id) }, { $set: { isActive } });
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

router.get('/paginatedSubCategories', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const categoryFilter = req.query.category || 'all';

    // Build filter conditions
    let filterCondition = { isActive: true };
    if (categoryFilter !== 'all') {
      // Find the statusId by statusName
      const category = await categorySchema.findOne({ categoryName: categoryFilter });
      if (category) {
        filterCondition.categoryId = category._id;
      }
    }

    // Get total count for pagination metadata
    const totalSubCategories = await subCategorySchema.countDocuments(filterCondition);

    // Get orders with pagination
    let subCategories = await subCategorySchema.find(filterCondition).skip(skip).limit(limit);

    if (subCategories && subCategories.length > 0) {
      let newarr = [];
      for (const element of subCategories) {
        let category = await categorySchema.findOne({ _id: element.categoryId });
        let temp = {
          _id: element._id,
          categoryId: element.categoryId,
          subCategoryName: element.subCategoryName,
          categoryName: category.categoryName,
          isActive: element.isActive,
          photoUrl: element.photoUrl
        }
        newarr.push(temp);
      }

      res.json({
        statusCode: 200,
        message: "success",
        result: {
          subCategories: newarr,
          pagination: {
            totalSubCategories,
            totalPages: Math.ceil(totalSubCategories / limit),
            currentPage: page,
            limit
          }
        }
      });
    } else {
      res.json({ statusCode: 404, message: "SubCategories not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

module.exports = router;