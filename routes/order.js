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
const moment  = require('moment');

// Create New Order
router.post('/addOrder', async (req, res) => {
    try {
        var total_value = 0;
        const { customerId,statusId,paymentTypeId, customerRemarks, deliveryDate, orderDetails } = req.body;
        const isActive = true;
        const orderDate = new Date();

       
        // const currentDate = moment();
        // let orderDate = moment(currentDate).format('DD-MM-YYYY');

        if (orderDetails && orderDetails.length > 0) {
          
          total_value = 0; // Start from 0
          for (let detail of orderDetails) {
              let product = await productSchema.findOne({_id:detail.productId})
              total_value += product.price * detail.quantity; // Add each item's total
          }
        }

        const newOrder = new orderSchema({
            customerId, total:total_value ,statusId, paymentTypeId, customerRemarks, orderDate, deliveryDate, isActive
        });

        const savedOrder = await newOrder.save();

        

        if (orderDetails && orderDetails.length > 0) {
          const productDetails = await Promise.all(
              orderDetails.map(async (detail) => {
                  const product = await productSchema.findOne({ _id: detail.productId });
                  return {
                      orderId: savedOrder._id,
                      productId: detail.productId,
                      quantity: detail.quantity,
                      amount : product.price ,
                      total: product ? product.price * detail.quantity:0,// Ensure product exists before accessing price
                      isActive: true,
                  };
              })
          );
      
          await orderDetailsSchema.insertMany(productDetails);
        }
        res.json({statusCode :200, message:"Order Created Successfully", orderId: savedOrder._id, total:total_value});
    // res.json({statusCode :200, message:"Order Created Successfully", orderId: savedOrder._id});
    
    } 
    catch (err) {
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

              let Order_date = moment(element.orderDate).format('DD-MM-YYYY');
              let Del_date = moment(element.deliveryDate).format('DD-MM-YYYY');

              let temp = {
                _id: element._id,
                customerId : element.customerId,
                statusId : element.statusId,
                paymentTypeId : element.paymentTypeId,
                customerName: customer.name,
                statusName: status.statusName,
                paymentName: payment.paymentName,
                total : element.total,
                customerRemarks : element.customerRemarks,
                orderDate : Order_date,
                deliveryDate :Del_date ,
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

                let Order_date = moment(order.orderDate).format('DD-MM-YYYY');
                let Del_date = moment(order.deliveryDate).format('DD-MM-YYYY');
              
                let temp = {
                    _id: order._id,
                    customerId : order.customerId,
                    statusId : order.statusId,
                    paymentTypeId : order.paymentTypeId,
                    customerName: customer.name,
                    statusName: status.statusName,
                    paymentName: payment.paymentName,
                    total : order.total,
                    customerRemarks : order.customerRemarks,
                    orderDate : Order_date,
                    deliveryDate : Del_date,
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
router.get('/deleteOrder/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = false;
    const orderExist = await orderSchema.findOne({ _id: (id) })
    if (orderExist) {
      const result = await orderSchema.updateOne({ _id: (id) },{$set:{isActive}});
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "Order not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Order deleted" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Order not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get OrderDetails With Order ID
router.get('/orderDetailsByorderId/:orderId', async (req, res) => {
  try {
    const {orderId} = req.params;
    let orderDetails = await orderDetailsSchema.find({ orderId: (orderId) });
    if (orderDetails) {
          let newarr = [];
          for (const element of orderDetails) {
            let product = await productSchema.findOne({ _id: element.productId });
            let order = await orderSchema.findOne({_id: element.orderId});
            let temp = {
              _id: element._id,
              productId : element.productId,
              orderId : element.orderId,
              productName : product.productName,
              quantity : element.quantity,
              amount: element.amount,
              total : element.total,
              isActive: element.isActive
            }
            newarr.push(temp);
            console.log(temp);
          }
          console.log(newarr);
          res.json({ statusCode: 200, message:"success", result: { orderDetails: newarr } });
        }
    else {
      res.json({ statusCode: 404, message: "Order Details not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get Order and OrderDetails by OrderId
router.get('/orderAndDetails/:id', async (req, res) => {
  try {
      const { id } = req.params;
      let newarr = [];
      let order = await orderSchema.findOne({ _id: (id) })
      if (order) {
          let customer = await customerSchema.findOne({ _id: order.customerId });
          let status = await statusSchema.findOne({ _id: order.statusId });
          let payment = await paymentSchema.findOne({_id: order.paymentTypeId});

          let Order_date = moment(order.orderDate).format('DD-MM-YYYY');
          let Del_date = moment(order.deliveryDate).format('DD-MM-YYYY');


          let temp = {
                _id: order._id,
                customerId : order.customerId,
                statusId : order.statusId,
                paymentTypeId : order.paymentTypeId,
                customerName: customer.name,
                statusName: status.statusName,
                paymentName: payment.paymentName,
                total : order.total,
                customerRemarks : order.customerRemarks,
                orderDate : Order_date,
                deliveryDate : Del_date,
                isActive: order.isActive
          }

          let customerData = {
            Name : customer.name,
            Email : customer.email,
            Contact : customer.mobileNo,
            Address : customer.address,
            Pincode : customer.pincode,
          }
              
          let orderDetails = await orderDetailsSchema.find({ orderId: (id) });
          if (orderDetails) {
   
            for (const element of orderDetails) {
              let product = await productSchema.findOne({ _id: element.productId });
              let order = await orderSchema.findOne({_id: element.orderId});
              let temp = {
                _id: element._id,
                productId : element.productId,
                orderId : element.orderId,
                productName : product.productName,
                quantity : element.quantity,
                amount: element.amount,
                total : element.total,
                isActive: element.isActive
              }
              newarr.push(temp);
              console.log(temp);
            }
          // console.log(newarr);
          // res.json({ statusCode: 200, message:"success", result: { orderDetails: newarr } });
        }



        res.json({ statusCode: 200, message:"Success Order and Details", result: { order: temp, orderDetails : newarr, customer:customerData } });
      }
      else {
          res.json({ statusCode: 404, message: "Orders not found" });
      }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Update the order status
router.put('/updateOrderStatus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {statusId,deliveryDate,adminRemarks} = req.body;
    const orderExist = await orderSchema.findOne({ _id: (id) })
    if (orderExist) {
      const result = await orderSchema.updateOne({ _id: (id) },{$set:{statusId, deliveryDate, adminRemarks}});
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "Order not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Order Status Updated !!" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Order not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

router.put('/cancelOrder/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {adminRemarks} = req.body;
    const statusId = "67bf462e1cda1de741312dc3"
    const orderExist = await orderSchema.findOne({ _id: (id) })
    if (orderExist) {
      const result = await orderSchema.updateOne({ _id: (id) },{$set:{statusId, adminRemarks}});
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "Order not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Order Cancelled !!" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Order not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get Order Statuses for Approval State
router.get('/getOrderStatus/:id', async (req, res) => {
  try {
    const {id} = req.params;
    let order = await orderSchema.findOne({ _id: (id) });
    if (order) {
          let status = await statusSchema.findOne({ _id: order.statusId });

          if (order.statusId  == "673626581da86f57e77d973c"){
            res.json({ statusCode: 200, message:"Success", result: { orderStatus:  1 } });
          }else if(order.statusId  == "67bf462e1cda1de741312dc3"){
            res.json({ statusCode: 200, message:"Success", result: { orderStatus:  2 } });
          }else{
            res.json({ statusCode: 200, message:"Success", result: { orderStatus:  3 } });
          }

          // res.json({ statusCode: 200, message:"Success", result: { orderStatus:  status.statusName } });
        }
    else {
      res.json({ statusCode: 404, message: "Order Status not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Update the order status
router.put('/acceptOrder/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const statusId = "673626631da86f57e77d973f";
    const {deliveryDate} = req.body;
    const orderExist = await orderSchema.findOne({ _id: (id) })
    if (orderExist) {
      const result = await orderSchema.updateOne({ _id: (id) },{$set:{statusId, deliveryDate, adminRemarks}});
      if (result.modifiedCount === 0) {
        res.json({ statusCode: 404, message: "Order not found" });
      }
      else {
        res.json({ statusCode: 200, result: { message: "Order Accepted !!" } });
      }
    }
    else {
      res.json({ statusCode: 404, message: "Order not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});


module.exports = router;