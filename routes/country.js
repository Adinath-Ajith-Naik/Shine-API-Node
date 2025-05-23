const express = require('express');
const router = express.Router();
const countrySchema = require('../models/country.models')

// Create a new country
router.post('/addCountry', async (req, res) => {
  try {
    const { countryName } = req.body;
    const isActive = true;
    const countryExist = await countrySchema.findOne({ countryName: (countryName) })
    if (countryExist) {
      res.json({ statusCode: 401, message: "Country already exist" });
    }
    else {
      const result = await countrySchema.create({ countryName, isActive })
      if (result._id) {
        res.json({ statusCode: 200, result: { countryid: result._id, countryName, isActive } });
      }
      else {
        res.json({ statusCode: 404, message: "Country not found" });
      }
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get all countries
router.get('/countryList', async (req, res) => {
  try {
    let countries = await countrySchema.find({ isActive: true });
    if (countries) {
      res.json({ statusCode: 200, result: { countries: countries } });
    }
    else {
      res.json({ statusCode: 404, message: "Country not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get all countries with limit
router.get('/country_home', async (req, res) => {
  try {
    let countries = await countrySchema.find().sort({ _id: -1 }).limit(2);
    if (countries) {
      res.json({ statusCode: 200, result: { countries: countries } });
    }
    else {
      res.json({ statusCode: 404, message: "Country not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get a single country by ID
router.get('/countryById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const countries = await countrySchema.findOne({ _id: (id) })
    if (countries) {
      res.json({ statusCode: 200, result: { countries: countries } });
    }
    else {
      res.json({ statusCode: 404, message: "Country not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Update a country by ID
router.put('/updateCountry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { countryName } = req.body;
    const countryExist = await countrySchema.findOne({ _id: (id) })
    const nameExist = await countrySchema.findOne({ countryName: countryName });
    if (countryExist && !nameExist) {
      const result = await countrySchema.updateOne({ _id: (id) }, { $set: { countryName } })
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "Country not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Country details updated" } });
      }
    }
    else {
      res.json({ statusCode: 401, message: "Country Name Already Exist" });
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Delete a country
router.put('/deleteCountry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = false;
    const countryExist = await countrySchema.findOne({ _id: (id) })
    if (countryExist) {
      const result = await countrySchema.updateOne({ _id: (id) }, { $set: { isActive } });
      if (result.deletedCount === 0) {
        res.json({ statusCode: 404, message: "Country not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Country deleted" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Country not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Paginated Country List

router.get('/paginatedCountry', async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const nameFilter = req.query.name || '';

    // Build filter query
    let filterQuery = { isActive: true };

    if (nameFilter) {
      filterQuery.countryName = { $regex: nameFilter, $options: 'i' };
    }


    // Get total count for pagination
    const totalCountries = await countrySchema.countDocuments(filterQuery);

    // Fetch paginated products
    let countries = await countrySchema
      .find(filterQuery)
      .skip(skip)
      .limit(limit);

    // Enrich product data with category, subcategory, and company details

    let newarr = [];
    if (countries && countries.length > 0) {
      for (const element of countries) {


        let temp = {
          _id: element._id,
          countryName: element.countryName,
          isActive: element.isActive
        }
        newarr.push(temp);
      }

    }

    // Calculate total pages
    const totalPages = Math.ceil(totalCountries / limit);

    res.json({
      statusCode: 200,
      message: "success",
      result: {
        countries: newarr,
        pagination: {
          totalCountries,
          currentPage: page,
          totalPages: totalPages,
          totalCountries: totalCountries,
          pageSize: limit
        }
      }
    });

  }
  catch (err) {
    console.log(err);
    res.json({ statusCode: 400, message: err.message })
  }
})


// Delete a country from DB

router.delete('/country/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const countryExist = await countrySchema.findOne({ _id: (id) })
    if (countryExist) {
      const result = await countrySchema.deleteOne({ _id: (id) });
      if (result.deletedCount === 0) {
        res.json({ statusCode: 404, message: "Country not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Country deleted" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Country not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});


module.exports = router;