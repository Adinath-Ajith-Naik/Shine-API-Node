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

router.post('/addOrder', async (req, res) => {
    try {
        const { customerId,total,statusId,paymentTypeId, remarks, deliveryDate, orderDetails } = req.body;
        const isActive = true;
        const orderDate = new Date();

        const newOrder = new orderSchema({
            customerId, total,statusId, paymentTypeId, remarks, orderDate, deliveryDate, isActive
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

        res.json({statusCode :200, message:"Order Created Successfully", orderId: savedOrder._id});
    
    } catch (err) {
      res.json({ statusCode: 400, message: err.message });
    }
});


module.exports = router;