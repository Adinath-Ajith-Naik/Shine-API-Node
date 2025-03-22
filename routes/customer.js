const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const router = express.Router();
const customerSchema = require('../models/customer.models');
const countrySchema = require('../models/country.models');
const stateSchema = require('../models/state.models');
const districtSchema = require('../models/district.models');

const userSchema = require('../models/user.models')
const sessionSchema = require('../models/session.models')

// Create a new Customer
router.post('/registerCustomer', async (req, res) => {
    try {
        const { name, mobileNo, email, address, pincode, countryId, stateId, districtId, password} = req.body;
        // const  isActive  = true;
        const customerExist = await customerSchema.findOne({ mobileNo: (mobileNo) })
        if (customerExist) {
          res.json({ statusCode: 401, message: "Customer already exist" });
        }
        else {
          let isActive = true
           
            const result = await customerSchema.create({ name, mobileNo, email, address, pincode, countryId, stateId, districtId,  isActive })
            let customerId = result._id;
            if (customerId) {
                let saltData = bcrypt.genSaltSync(10);
                const hashedPassword = await bcrypt.hash(password, saltData);
                //const sessionToken = jwt.sign({ mobileNo: phoneNumber }, process.env.JWT_SECRET);
                const userRegistration = await userSchema.create({ mobileNo, password: hashedPassword, customerId, saltData })
                let currentTime = new Date();
                //await sessionSchema.create({ customerId, sessionToken, currentTime })
                if (userRegistration) {
                    res.json({
                        statusCode: 200, message: "success", result: {
                           // sessionToken,
                           mobileNo
                        }
                    });
                }
                else {
                    res.json({ statusCode: 401, message: "user registration failed" });
                }
            }
            else {
                res.json({ statusCode: 404, message: "something went wrong" });
            }
        }
      }
      catch (err) {
        if(customerId){
            await customerSchema.deleteOne({ _id: (customerId) });
        }
        
        res.json({ statusCode: 400, message: err.message })
    }
});
  
// Get all customers
router.get('/customerList', async (req, res) => {
    try {
      let customers = await customerSchema.find({isActive : true});
      if (customers) {
            let newarr = [];
            for (const element of customers) {
              console.log("Inside FOR Loop");
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
                mobileNo : element.mobileNo,
                address : element.address,
                pincode : element.pincode,
                isActive: element.isActive
              }
              newarr.push(temp);
              console.log("-----------------------------")
              console.log(temp);
            }
            console.log("Hiiiiii")
            console.log(newarr);
            res.json({ statusCode: 200, message:"success", result: { customers: newarr } });
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
router.get('/customerById/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await customerSchema.findOne({ _id: (id) })
      if (customer) {
            let country = await countrySchema.findOne({ _id: customer.countryId });
            let state = await stateSchema.findOne({ _id: customer.stateId });
            let district = await districtSchema.findOne({_id: customer.districtId});
            let temp = {
              _id: customer._id,
              countryId : customer.countryId,
              stateId : customer.stateId,
              districtId : customer.districtId,
              districtName: district.districtName,
              stateName: state.stateName,
              countryName: country.countryName,
              name : customer.name,
              email : customer.email,
              mobileNo : customer.mobileNo,
              address : customer.address,
              pincode : customer.pincode,
              isActive: customer.isActive
            }
            
        
           
            res.json({ statusCode: 200, message:"success", result: { customers: temp } });
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
  
// Update a customer details by ID
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

// Latest Customer List
router.get('/dashboardCustomerList', async (req, res) => {
  try {
    let customers = await customerSchema.find({isActive : true}).sort({_id : -1}).limit(3);
    if (customers) {
          let newarr = [];
          for (const element of customers) {
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
              mobileNo : element.mobileNo,
              address : element.address,
              pincode : element.pincode,
              isActive: element.isActive
            }
            newarr.push(temp);
            console.log("-----------------------------")
            console.log(temp);
          }
          console.log("Hiiiiii")
          console.log(newarr);
          res.json({ statusCode: 200, message:"success", result: { customers: newarr } });
        }
    else {
      res.json({ statusCode: 404, message: "Customers not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});


// Login Customer
router.post('/loginCustomer', async (req, res) => {
  try {
      const { mobileNo, password } = req.body;
      const userExist = await userSchema.findOne({ mobileNo: (mobileNo) })

      if (userExist) {
          console.log(userExist);
          const passwordMatches = await bcrypt.compare(password, userExist.password);
          if (passwordMatches) {
              const sesssionExist = await sessionSchema.findOne({ customerId: (userExist.customerId), sessionToken: { $ne: null } })
              if (sesssionExist) {
                  await sessionSchema.updateOne({ _id: (sesssionExist._id) }, { $set: { sessionToken: null } })
              }
              const sessionToken = jwt.sign({ mobileNo: mobileNo }, "ABC123SECRETCODE");
              let currentTime = new Date();
              let sessionCreated = await sessionSchema.create({ customerId: userExist.customerId, sessionToken, currentTime })
             
              const customer = await customerSchema.findOne({ _id: (userExist.customerId) })

              if (sessionCreated) {
                  res.json({
                      statusCode: 200, message: "success", result: {
                          sessionToken,
                          mobileNo: customer.mobileNo,
                          email: customer.email,
                          name: customer.name,
                          customerId : userExist.customerId
                      }
                  });
              }
              else {
                  res.json({ statusCode: 401, message: "user login failed" });
              }
          }
          else {
              res.json({ statusCode: 400, message: "incorrect password" })
          }

      }
      else {
          res.json({ statusCode: 404, message: "user not found" });
      }
  }
  catch (err) {
      res.json({ statusCode: 400, message: err.message })
  }
});

// Forgot Password Customer

router.post('/forgotPasswordCustomer', async (req, res) => {
  try {
      const { mobileNo,  emailId} = req.body;
      const userExist = await employeeSchema.findOne({ mobileNo: (mobileNo) })
         
      if (userExist) {
          const newPassword = Math.random().toString(36).slice(-8);
          let saltData = bcrypt.genSaltSync(10);
          const hashedPassword = await bcrypt.hash(newPassword, saltData);
          await updatePasswordById(emailId, hashedPassword);
          const result = await userSchema.updateOne({ _id: (userExist._id) }, { $set: { password : hashedPassword} })
          
        const emailProvider = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'your_email_address',
            pass: 'your_email_password'
          }
        });

        const mailOptions = {
          from: 'your_email_address',
          to: emailId,
          subject: 'Password Reset',
          text: `Your new password is: ${newPassword}`
        };

        await emailProvider.sendMail(mailOptions);
        res.status(200).send({ statusCode: 200, message: "A new password is shared in the registered email" });
      }
      else {
          res.status(404).send({ statusCode: 404, message: "user not found" });
      }
  }
  catch (err) {
      res.status(400).send({ statusCode: 400, message: err.message })
  }
});

    
module.exports = router;