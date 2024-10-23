const express = require('express');
const router = express.Router();
const customerSchema = require('../models/customer.models');
const countrySchema = require('../models/country.models');
const stateSchema = require('../models/state.models');
const districtSchema = require('../models/district.models');

// Create a new Customer
router.post('/addCustomer', async (req, res) => {
    try {
        const { name, mobileNo, email, address, pincode, countryId, stateId, districtId } = req.body;
        const  isActive  = true;
        const customerExist = await customerSchema.findOne({ mobileNo: (mobileNo) })
        if (customerExist) {
          res.json({ statusCode: 401, message: "Customer already exist" });
        }
        else {
          const result = await customerSchema.create({ name, mobileNo, email, address, pincode, countryId, stateId, districtId, isActive })
          if (result._id) {
            res.json({ statusCode: 200, result: { customerId: result._id, name, mobileNo, email, address, pincode, countryId, stateId, districtId, isActive } });
          }
          else {
            res.json({ statusCode: 404, message: "Customer not found" });
          }
        }
      }
      catch (err) {
        res.json({ statusCode: 400, message: err.message })
      }
  });
  
// Get all customers
router.get('/customerList', async (req, res) => {
    try {
      let customers = await customerSchema.find();
      if (customers) {
        res.json({ statusCode: 200, result: { customers: customers } });
      }
      else {
        res.json({ statusCode: 404, message: "Customers not found" });
      }
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
  });
  
// Get customer details
router.get('/customer/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const customers = await customerSchema.findOne({ _id: (id) })
      if (customers) {
        res.json({ statusCode: 200, result: { customers: customers } });
      }
      else {
        res.json({ statusCode: 404, message: "Customer Not found" });
      }
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
  });

// Get customers by States
router.get('/customer/getByState/:stateId', async (req, res) => {
        try {
          const { stateId } = req.params;
          const customers = await customerSchema.find({ stateId: (stateId) })
          if (customers) {
            res.json({ statusCode: 200, result: { customers: customers } });
          }
          else {
            res.json({ statusCode: 404, message: "Customers not found" });
          }
        }
        catch (err) {
          res.json({ statusCode: 400, message: err.message })
        }
    });

// Get customers by District
router.get('/customer/getByDistrict/:districtId', async (req, res) => {
    try {
      const { districtId } = req.params;
      const customers = await customerSchema.find({ districtId: (districtId) })
      if (customers) {
        res.json({ statusCode: 200, result: { customers: customers } });
      }
      else {
        res.json({ statusCode: 404, message: "Customers not found" });
      }
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
});
  
// Update a customer by ID
router.put('/customer/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, mobileNo, email, address, pincode, countryId, stateId, districtId} = req.body;
      const customerExist = await customerSchema.findOne({ _id: (id) })
    if (customerExist) {
      const result = await customerSchema.updateOne({ _id: (id) }, { $set: { name, mobileNo, email, address, pincode, countryId, stateId, districtId } })
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "Customers not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Customer details updated" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Customer not found" });
    }

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
  });
  
// Delete a customer by ID
router.get('/deleteCustomer/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const isActive = false;
      const customerExist = await customerSchema.findOne({ _id: (id) })
      if (customerExist) {
        const result = await customerSchema.updateOne({ _id: (id) },{$set:{isActive}});
        if (result.modifiedCount === 0) {
          res.json({ statusCode: 404, message: "Customer not found" });
        }
        else {
          res.json({ statusCode: 200, result: { message: "Customer deleted" } });
        }
      }
      else {
        res.json({ statusCode: 404, message: "Customer not found" });
      }
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
  });
    
module.exports = router;