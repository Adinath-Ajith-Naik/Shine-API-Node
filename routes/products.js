const express = require('express');
const router = express.Router();
const categorySchema = require('../models/category.models');
const subCategorySchema = require('../models/subCategory.models');
const companySchema = require('../models/company.models');
const productSchema = require('../models/product.models')
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');


// Create a new product
router.post('/addProduct', async (req, res) => {
    try {
      const { productName,price,categoryId,subCategoryId, companyId, photoUrl1, photoUrl2, description,weight } = req.body;
      const isActive = true;
  
      // Check if category already exists
      const productExist = await productSchema.findOne({ productName:productName});
      if (productExist) {
        return res.json({ statusCode: 401, message: "Product already exists" });
      }
  
      // Prepare and save the image if provided
      let savedPhoto1 = null;
      if (photoUrl1) {
        const newId = uuidv4();
        const path = `Images\\Products\\${newId}.jpg`;
        const base64Image = photoUrl1.split(';base64,').pop();
        const binaryData = Buffer.from(base64Image, 'base64');
  
        fs.writeFile(path, binaryData, (err) => {
          if (err) {
            console.error("Error writing image file:", err);
            return res.json({ statusCode: 500, message: "Image upload failed" });
          }
          console.log("Image 1 uploaded successfully:", path);
        });
        savedPhoto1 = `${newId}.jpg`;
      }

      let savedPhoto2 = null;
      if (photoUrl2) {
        const newId = uuidv4();
        const path = `Images\\Products\\${newId}.jpg`;
        const base64Image = photoUrl2.split(';base64,').pop();
        const binaryData = Buffer.from(base64Image, 'base64');
  
        fs.writeFile(path, binaryData, (err) => {
          if (err) {
            console.error("Error writing image file:", err);
            return res.json({ statusCode: 500, message: "Image upload failed" });
          }
          console.log("Image 2 uploaded successfully:", path);
        });
        savedPhoto2 = `${newId}.jpg`;
      }
  
      // Create a new category document
      const newProduct = await productSchema.create({
        productName,
        price,
        categoryId,
        subCategoryId,
        companyId,
        weight,
        description,
        photoUrl1: savedPhoto1,
        photoUrl2: savedPhoto2,
        isActive,
      });
  
      if (newProduct._id) {
        res.json({
          statusCode: 200,
          result: {
            productId: newProduct._id,
            Productname: newProduct.productName,
            price: newProduct.price,
            categoryId: newProduct.categoryId,
            subCategoryId: newProduct.subCategoryId,
            companyId: newProduct.companyId,
            weight: newProduct.weight,
            description: newProduct.description,
            photoUrl1 : newProduct.photoUrl1,
            photoUrl2: newProduct.photoUrl2,
            isActive: newProduct.isActive,
          },
        });
      } else {
        res.json({ statusCode: 404, message: "Failed to add product" });
      }
    } catch (err) {
      res.json({ statusCode: 400, message: err.message });
    }
});

// Get Product List
router.get('/productList', async (req, res) => {
    try {
      let products = await productSchema.find({isActive : true});
      if (products) {
        let newarr = [];
        for (const element of products) {
          let category = await categorySchema.findOne({ _id: element.categoryId });
          let subCategory = await subCategorySchema.findOne({ _id: element.subCategoryId });
          let company = await companySchema.findOne({_id: element.companyId});
          let temp = {
            _id: element._id,
            categoryId : element.categoryId,
            subCategoryId : element.subCategoryId,
            companyId : element.companyId,
            categoryName: category.categoryName,
            subCategoryName: subCategory.subCategoryName,
            companyName: company.name,
            productName : element.productName,
            price : element.price,
            description : element.description,
            weight : element.weight,
            photoUrl1 : element.photoUrl1,
            photoUrl2 : element.photoUrl2,
            isActive: element.isActive
          }
          newarr.push(temp);
        }
        console.log(newarr);
        res.json({ statusCode: 200, message:"success", result: { products: newarr } });
      }
      else {
        res.json({ statusCode: 404, message: "Product not found" });
      }
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
});

// Get a Product by ID
router.get('/productById/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await productSchema.findOne({ _id: (id) })
      if (product) {
        let category = await categorySchema.findOne({ _id: product.categoryId });
        let subCategory = await subCategorySchema.findOne({ _id: product.subCategoryId });
        let company = await companySchema.findOne({_id: product.companyId});
        let temp = {
          _id: product._id,
          categoryId : product.categoryId,
          subCategoryId : product.subCategoryId,
          companyId : product.companyId,
          categoryName: category.categoryName,
          subCategoryName: subCategory.subCategoryName,
          companyName: company.companyName,
          name : product.productName,
          price : product.price,
          description : product.description,
          weight : product.weight,
          photoUrl1 : product.photoUrl1,
          photoUrl2 : product.photoUrl2,
          isActive: product.isActive
        }
        
        res.json({ statusCode: 200, result: { product: temp } });
      }
      else {
        res.json({ statusCode: 404, message: "Product not found" });
      }
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
});
  
// Update a company by ID
router.put('/updateProduct/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { productName, price, weight, description, categoryId, subCategoryId, companyId, photoUrl1, photoUrl2} = req.body;
      // const photoUrl = req.body.logoUrl;
      let new_image;
      const productExist = await productSchema.findOne({ _id: (id) })
      if (productExist) {
  
        let savedPhoto1 = null;
        if (photoUrl1) {
            const newId = uuidv4();
            const path = `Images\\Products\\${newId}.jpg`;
            const base64Image = photoUrl1.split(';base64,').pop();
            const binaryData = Buffer.from(base64Image, 'base64');
            
            fs.writeFile(path, binaryData, (err) => {
            if (err) {
                console.error("Error writing image file:", err);
                return res.json({ statusCode: 500, message: "Image upload failed" });
            }
            console.log("Image 1 uploaded successfully:", path);
            });
            savedPhoto1 = `${newId}.jpg`;
        }

        let savedPhoto2 = null;
        if (photoUrl2) {
            const newId = uuidv4();
            const path = `Images\\Products\\${newId}.jpg`;
            const base64Image = photoUrl2.split(';base64,').pop();
            const binaryData = Buffer.from(base64Image, 'base64');
            
            fs.writeFile(path, binaryData, (err) => {
            if (err) {
                console.error("Error writing image file:", err);
                return res.json({ statusCode: 500, message: "Image upload failed" });
            }
            console.log("Image 2 uploaded successfully:", path);
            });
            savedPhoto2 = `${newId}.jpg`;
        }

        const result = await productSchema.updateMany({ _id: (id) }, { $set: {productName: productName, price: price, weight:weight, description: description, categoryId: categoryId, subCategoryId: subCategoryId, companyId: companyId, photoUrl1: savedPhoto1, photoUrl2: savedPhoto2}});
        if (result.modifiedCount === 0) {
          res.json({ statusCode: 404, message: "Product not found 132" });
        }
        else {
          res.json({ statusCode: 200, result: { message: "Product Details Updated" } });
        }
      }
      else {
        res.json({ statusCode: 404, message: "Product not found" });
      }
  
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
});
  
// Delete a company by ID
router.put('/deleteProduct/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const isActive = false;
      const productExist = await productSchema.findOne({ _id: (id) })
      if (productExist) {
        const result = await productSchema.updateOne({ _id: (id) }, {$set:{isActive}});
        if (result.modifiedCount === 0) {
          res.json({ statusCode: 404, message: "Product not found" });
        }
        else {
          res.json({ statusCode: 200, result: { message: "Product deleted" } });
        }
      }
      else {
        res.json({ statusCode: 404, message: "Product not found" });
      }
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
});

router.get('/paginatedProducts', async (req, res) => {
  try {
      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Filtering parameters
      const nameFilter = req.query.name || '';
      const priceFilter = req.query.price || '';
      const categoryFilter = req.query.category || '';
      const subCategoryFilter = req.query.subCategory || '';

      // Build filter query
      let filterQuery = { isActive: true };

      if (nameFilter) {
          filterQuery.productName = { $regex: nameFilter, $options: 'i' };
      }

      if (priceFilter) {
          // Change: Use exact price matching
          filterQuery.price = parseFloat(priceFilter);
      }

      // If category or subcategory filters are provided, we'll need to do a lookup
      let categoryIds = [];
      let subCategoryIds = [];

      if (categoryFilter) {
          const categories = await categorySchema.find({ 
              categoryName: { $regex: categoryFilter, $options: 'i' } 
          });
          categoryIds = categories.map(cat => cat._id);
          filterQuery.categoryId = { $in: categoryIds };
      }

      if (subCategoryFilter) {
          const subCategories = await subCategorySchema.find({ 
              subCategoryName: { $regex: subCategoryFilter, $options: 'i' } 
          });
          subCategoryIds = subCategories.map(subCat => subCat._id);
          filterQuery.subCategoryId = { $in: subCategoryIds };
      }

      // Get total count for pagination
      const totalProducts = await productSchema.countDocuments(filterQuery);

      // Fetch paginated products
      let products = await productSchema
          .find(filterQuery)
          .skip(skip)
          .limit(limit);

      // Enrich product data with category, subcategory, and company details
      if (products && products.length > 0) {
        let newarr = [];
        for (const element of products) {
            let category = await categorySchema.findOne({ _id: element.categoryId });
            let subCategory = await subCategorySchema.findOne({ _id: element.subCategoryId });
            let company = await companySchema.findOne({_id: element.companyId});
            
            let temp = {
                _id: element._id,
                categoryId: element.categoryId,
                subCategoryId: element.subCategoryId,
                companyId: element.companyId,
                categoryName: category ? category.categoryName : 'N/A',
                subCategoryName: subCategory ? subCategory.subCategoryName : 'N/A',
                companyName: company ? company.name : 'N/A',
                productName: element.productName,
                price: element.price,
                description: element.description,
                weight: element.weight,
                photoUrl1: element.photoUrl1,
                photoUrl2: element.photoUrl2,
                isActive: element.isActive
            }
            newarr.push(temp);
        }
  
      }
      
      // Calculate total pages
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({ 
          statusCode: 200, 
          message: "success", 
          result: { 
              products: newarr,
              pagination: {
                totalProducts, 
                  currentPage: page,
                  totalPages: totalPages,
                  totalProducts: totalProducts,
                  pageSize: limit
              }
          } 
      });
  }
  catch (err) {
      res.json({ statusCode: 400, message: err.message })
  }
});

module.exports = router;
