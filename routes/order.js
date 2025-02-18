const express = require('express');
const router = express.Router();
const orderSchema = require('../models/order.models'); 
const orderDetailsSchema = require('../models/orderDetails.models');
const customerSchema = require('../models/customer.models');
const statusSchema = require('../models/status.models');
const paymentSchema = require('../models/payment.models');
const productSchema = require('../models/product.models');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create New Order
router.post('/addOrder', async (req, res) => {
    try {
        var total_value = 0;
        const { customerId,total,statusId,paymentTypeId, remarks, deliveryDate, orderDetails } = req.body;
        const isActive = true;
        const orderDate = new Date();

        if (orderDetails && orderDetails.length > 0) {
            total_value = 0; // Start from 0
            for (let detail of orderDetails) {
                total_value += detail.amount * detail.quantity; // Add each item's total
            }
        }

        const newOrder = new orderSchema({
            customerId, total:total_value ,statusId, paymentTypeId, remarks, orderDate, deliveryDate, isActive
        });

        const savedOrder = await newOrder.save();

        if(orderDetails && orderDetails.length > 0){
            const detailsToInsert = orderDetails.map(detail=>({
                orderId : savedOrder._id,
                productId : detail.productId,
                quantity : detail.quantity,
                amount : detail.amount,
                total : detail.amount * detail.quantity,
                // total : detail.total,
                isActive : true,
            }));
            
            
            await orderDetailsSchema.insertMany(detailsToInsert)
        }

        res.json({statusCode :200, message:"Order Created Successfully", orderId: savedOrder._id, total:total_value});
    
    } catch (err) {
      res.json({ statusCode: 400, message: err.message });
    }
});

// Get OrderList
router.get('/orderList', async (req, res) => {
    try {
      let orders = await orderSchema.find({isActive : true});
      if (orders) {
            let newarr = [];
            for (const element of orders) {
            //   console.log("Inside FOR Loop");
              let customer = await customerSchema.findOne({ _id: element.customerId });
              let status = await statusSchema.findOne({ _id: element.statusId });
              let payment = await paymentSchema.findOne({_id: element.paymentTypeId});
              let temp = {
                _id: element._id,
                customerId : element.customerId,
                statusId : element.statusId,
                paymentTypeId : element.paymentTypeId,
                customerName: customer.name,
                statusName: status.statusName,
                paymentName: payment.paymentName,
                total : element.total,
                remarks : element.remarks,
                orderDate : element.orderDate,
                deliveryDate : element.deliveryDate,
                isActive: element.isActive
              }
              newarr.push(temp);
              console.log(temp);
            }
            console.log(newarr);
            res.json({ statusCode: 200, message:"success", result: { orders: newarr } });
          }
      else {
        res.json({ statusCode: 404, message: "Orders not found" });
      }
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
});

// Get Order By Id
router.get('/orderById/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let order = await orderSchema.findOne({ _id: (id) })
         if (order) {
                let customer = await customerSchema.findOne({ _id: order.customerId });
                let status = await statusSchema.findOne({ _id: order.statusId });
                let payment = await paymentSchema.findOne({_id: order.paymentTypeId});
                let temp = {
                    _id: order._id,
                    customerId : order.customerId,
                    statusId : order.statusId,
                    paymentTypeId : order.paymentTypeId,
                    customerName: customer.name,
                    statusName: status.statusName,
                    paymentName: payment.paymentName,
                    total : order.total,
                    remarks : order.remarks,
                    orderDate : order.orderDate,
                    deliveryDate : order.deliveryDate,
                    isActive: order.isActive
                }
                res.json({ statusCode: 200, message:"success", result: { order: temp } });
            }
        else {
            res.json({ statusCode: 404, message: "Orders not found" });
        }
    }
    catch (err) {
      res.json({ statusCode: 400, message: err.message })
    }
});

// Delete Order

// Get Orders With Order Details

// Get single order details

// Get Single Order along with Details


module.exports = router;