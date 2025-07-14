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
const moment = require('moment');
const { log } = require('console');
// const generateOrderNumber = require("../orderCounter");


async function generateInvoiceNumber() {
  // const today = new Date();
  // console.log("Date : ", today)
  // const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

  // // Find the last order for today
  // const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  // const lastOrder = await orderSchema.findOne({
  //   orderDate: {
  //     $gte: startOfDay,
  //     $lte: endOfDay
  //   }
  // }).sort({ invoiceNumber: -1 });

  // let nextSequence = 1;

  // if (lastOrder && lastOrder.invoiceNumber) {
  //   // Extract the sequence number from the last invoice number
  //   const lastInvoiceNumber = lastOrder.invoiceNumber;
  //   const parts = lastInvoiceNumber.split('-');
  //   if (parts.length === 2) {
  //     const lastSequence = parseInt(parts[1]);
  //     nextSequence = lastSequence + 1;
  //   }
  // }

  // // Format: YYYYMMDD-001, YYYYMMDD-002, etc.
  // const formattedDate = dateString.replace(/-/g, '');
  // const invoiceNumber = `${formattedDate}-${nextSequence.toString().padStart(3, '0')}`;

  // return invoiceNumber;

  const lastOrder = await orderSchema.findOne({}).sort({ invoiceNumber: -1 });

  let nextSequence = 1;

  if (lastOrder && lastOrder.invoiceNumber) {
    // Extract the sequence number from the last invoice number
    const lastInvoiceNumber = lastOrder.invoiceNumber;
    const lastSequence = parseInt(lastInvoiceNumber);
    nextSequence = lastSequence + 1;
  }

  // Format: 001, 002, 003, etc.
  const invoiceNumber = nextSequence.toString().padStart(3, '0');

  return invoiceNumber;
}

// Create order 

router.post('/addOrder', async (req, res) => {
  try {
    var total_value = 0;
    const statusId = "673626581da86f57e77d973c";
    const { customerId, paymentTypeId, customerRemarks, orderDetails } = req.body;
    const isActive = true;
    const orderDate = new Date();

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    if (orderDetails && orderDetails.length > 0) {

      total_value = 0; // Start from 0
      for (let detail of orderDetails) {
        let product = await productSchema.findOne({ _id: detail.productId })
        total_value += product.price * detail.quantity; // Add each item's total
      }
    }

    const newOrder = new orderSchema({
      customerId,
      total: total_value,
      statusId,
      paymentTypeId,
      customerRemarks,
      orderDate,
      invoiceNumber, // Add invoice number to order
      isActive
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
            amount: product.price,
            total: product ? product.price * detail.quantity : 0, // Ensure product exists before accessing price
            isActive: true,
          };
        })
      );

      await orderDetailsSchema.insertMany(productDetails);
    }

    res.json({
      statusCode: 200,
      message: "Order Created Successfully",
      orderId: savedOrder._id,
      invoiceNumber: invoiceNumber,
      total: total_value
    });

  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message });
  }
});


// Test Order
// router.post('/testOrder', async (req, res) => {
//   try {
//     var total_value = 0;
//     const statusId = "673626581da86f57e77d973c";
//     const { customerId, paymentTypeId, customerRemarks, orderDetails } = req.body;
//     const isActive = true;
//     const orderDate = new Date();

//     // const orderNumber = await generateOrderNumber();

//     const invoiceNumber = await generateInvoiceNumber();

//     if (orderDetails && orderDetails.length > 0) {

//       total_value = 0; // Start from 0
//       for (let detail of orderDetails) {
//         let product = await productSchema.findOne({ _id: detail.productId })
//         total_value += product.price * detail.quantity; // Add each item's total
//       }
//     }

//     const newOrder = new orderSchema({
//       customerId, total: total_value, statusId, paymentTypeId, customerRemarks, orderDate, isActive
//     });

//     const savedOrder = await newOrder.save();

//     if (orderDetails && orderDetails.length > 0) {
//       const productDetails = await Promise.all(
//         orderDetails.map(async (detail) => {
//           const product = await productSchema.findOne({ _id: detail.productId });
//           return {
//             orderId: savedOrder._id,
//             productId: detail.productId,
//             quantity: detail.quantity,
//             amount: product.price,
//             total: product ? product.price * detail.quantity : 0,// Ensure product exists before accessing price
//             isActive: true,
//           };
//         })
//       );

//       await orderDetailsSchema.insertMany(productDetails);
//     }
//     res.json({ statusCode: 200, message: "Order Created Successfully", orderId: savedOrder._id, total: total_value });
//     // res.json({statusCode :200, message:"Order Created Successfully", orderId: savedOrder._id});

//   }
//   catch (err) {
//     res.json({ statusCode: 400, message: err.message });
//   }
// });

// Get OrderList
router.get('/orderList', async (req, res) => {
  try {
    let orders = await orderSchema.find({ isActive: true });
    if (orders) {
      let newarr = [];
      for (const element of orders) {
        //   console.log("Inside FOR Loop");
        let customer = await customerSchema.findOne({ _id: element.customerId });
        let status = await statusSchema.findOne({ _id: element.statusId });
        let payment = await paymentSchema.findOne({ _id: element.paymentTypeId });

        let Order_date = moment(element.orderDate).format('DD-MM-YYYY');
        let Del_date = moment(element.deliveryDate).format('DD-MM-YYYY');

        let temp = {
          _id: element._id,
          customerId: element.customerId,
          statusId: element.statusId,
          paymentTypeId: element.paymentTypeId,
          invoiceNumber: element.invoiceNumber,
          customerName: customer.name,
          statusName: status.statusName,
          paymentName: payment.paymentName,
          total: element.total,
          customerRemarks: element.customerRemarks,
          adminRemarks: element.adminRemarks,
          orderDate: Order_date,
          deliveryDate: Del_date,
          isActive: element.isActive
        }
        newarr.push(temp);
        console.log(temp);
      }
      console.log(newarr);
      res.json({ statusCode: 200, message: "success", result: { orders: newarr } });
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
      let payment = await paymentSchema.findOne({ _id: order.paymentTypeId });

      let Order_date = moment(order.orderDate).format('DD-MM-YYYY');
      let Del_date = moment(order.deliveryDate).format('DD-MM-YYYY');

      let temp = {
        _id: order._id,
        customerId: order.customerId,
        statusId: order.statusId,
        paymentTypeId: order.paymentTypeId,
        customerName: customer.name,
        statusName: status.statusName,
        paymentName: payment.paymentName,
        total: order.total,
        customerRemarks: order.customerRemarks,
        adminRemarks: order.adminRemarks,
        orderDate: Order_date,
        deliveryDate: Del_date,
        isActive: order.isActive
      }
      res.json({ statusCode: 200, message: "success", result: { order: temp } });
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
      const result = await orderSchema.updateOne({ _id: (id) }, { $set: { isActive } });
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
    const { orderId } = req.params;
    let orderDetails = await orderDetailsSchema.find({ orderId: (orderId) });
    if (orderDetails) {
      let newarr = [];
      for (const element of orderDetails) {
        let product = await productSchema.findOne({ _id: element.productId });
        let order = await orderSchema.findOne({ _id: element.orderId });
        let temp = {
          _id: element._id,
          productId: element.productId,
          orderId: element.orderId,
          productName: product.productName,
          quantity: element.quantity,
          amount: element.amount,
          total: element.total,
          isActive: element.isActive
        }
        newarr.push(temp);
        console.log(temp);
      }
      console.log(newarr);
      res.json({ statusCode: 200, message: "success", result: { orderDetails: newarr } });
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
      let payment = await paymentSchema.findOne({ _id: order.paymentTypeId });

      let Order_date = moment(order.orderDate).format('DD-MM-YYYY');

      let Exp_Del_date = null;
      let Acc_date = null;
      let Pack_date = null;
      let Trans_date = null;
      let Del_date = null;


      if (order.expectedDeliveryDate) {
        Exp_Del_date = moment(order.expectedDeliveryDate).format('DD-MM-YYYY');
      }

      if (order.orderAcceptDate) {
        Acc_date = moment(order.orderAcceptDate).format('DD-MM-YYYY');
      }

      if (order.packingDate) {
        Pack_date = moment(order.packingDate).format('DD-MM-YYYY');
      }

      if (order.transportDate) {
        Trans_date = moment(order.transportDate).format('DD-MM-YYYY');
      }

      if (order.deliveryDate) {
        Del_date = moment(order.deliveryDate).format('DD-MM-YYYY');
      }


      let temp = {
        _id: order._id,
        customerId: order.customerId,
        statusId: order.statusId,
        paymentTypeId: order.paymentTypeId,
        invoiceNumber : order.invoiceNumber,
        customerName: customer.name,
        statusName: status.statusName,
        paymentName: payment.paymentName,
        total: order.total,
        customerRemarks: order.customerRemarks,
        adminRemarks: order.adminRemarks,
        orderDate: Order_date,
        expectedDeliveryDate: Exp_Del_date,
        orderAcceptDate: Acc_date,
        packingDate: Pack_date,
        transportDate: Trans_date,
        deliveryDate: Del_date,
        isActive: order.isActive
      }

      let customerData = {
        Name: customer.name,
        Email: customer.email,
        Contact: customer.mobileNo,
        Address: customer.address,
        Pincode: customer.pincode,
      }

      let orderDetails = await orderDetailsSchema.find({ orderId: (id) });
      if (orderDetails) {

        for (const element of orderDetails) {
          let product = await productSchema.findOne({ _id: element.productId });
          let order = await orderSchema.findOne({ _id: element.orderId });
          let temp = {
            _id: element._id,
            productId: element.productId,
            orderId: element.orderId,
            productName: product.productName,
            quantity: element.quantity,
            amount: element.amount,
            total: element.total,
            isActive: element.isActive
          }
          newarr.push(temp);
          console.log(temp);
        }
        // console.log(newarr);
        // res.json({ statusCode: 200, message:"success", result: { orderDetails: newarr } });
      }



      res.json({ statusCode: 200, message: "Success Order and Details", result: { order: temp, orderDetails: newarr, customer: customerData } });
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
    const { statusId } = req.body;
    const orderExist = await orderSchema.findOne({ _id: (id) })
    if (orderExist) {

      if (statusId == "673626751da86f57e77d9742") {
        const packingDate = new Date();
        const result = await orderSchema.updateOne({ _id: (id) }, { $set: { statusId, packingDate } });
        if (result.modifiedCount === 0) {
          res.json({ statusCode: 404, message: "Order not found" });
        }
        else {
          res.json({ statusCode: 200, result: { message: "Order Status (Packing) Updated !!" } });
        }
      }
      else if (statusId == "673626851da86f57e77d9745") {
        const transportDate = new Date();
        const result = await orderSchema.updateOne({ _id: (id) }, { $set: { statusId, transportDate } });
        if (result.modifiedCount === 0) {
          res.json({ statusCode: 404, message: "Order not found" });
        }
        else {
          res.json({ statusCode: 200, result: { message: "Order Status (Transportation) Updated !!" } });
        }
      }
      else if (statusId == "673626901da86f57e77d9748") {
        const deliveryDate = new Date();
        const result = await orderSchema.updateOne({ _id: (id) }, { $set: { statusId, deliveryDate } });
        if (result.modifiedCount === 0) {
          res.json({ statusCode: 404, message: "Order not found" });
        }
        else {
          res.json({ statusCode: 200, result: { message: "Order Status (Delivery) Updated !!" } });
        }
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

// Status Changingggg
router.put('/test/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { statusId } = req.body;
    const orderExist = await orderSchema.findOne({ _id: (id) })
    if (orderExist) {
      const result = await orderSchema.updateOne({ _id: (id) }, { $set: { statusId } });
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

// Cancel Order 
router.put('/cancelOrder/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminRemarks } = req.body;
    const statusId = "67bf462e1cda1de741312dc3"
    const orderExist = await orderSchema.findOne({ _id: (id) })
    if (orderExist) {
      const result = await orderSchema.updateOne({ _id: (id) }, { $set: { statusId, adminRemarks } });
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
    const { id } = req.params;
    let order = await orderSchema.findOne({ _id: (id) });
    if (order) {
      let status = await statusSchema.findOne({ _id: order.statusId });

      if (order.statusId == "673626581da86f57e77d973c") {
        res.json({ statusCode: 200, message: "Success", result: { orderStatus: 1 } });
      } else if (order.statusId == "67bf462e1cda1de741312dc3") {
        res.json({ statusCode: 200, message: "Success", result: { orderStatus: 2 } });
      } else if (order.statusId == "673626631da86f57e77d973f" || order.statusId == "673626751da86f57e77d9742" || order.statusId == "673626851da86f57e77d9745") {
        res.json({ statusCode: 200, message: "Success", result: { orderStatus: 3 } });
      } else {
        res.json({ statusCode: 200, message: "Success", result: { orderStatus: 4 } });
      }
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
    const { expectedDeliveryDate, adminRemarks } = req.body;
    const orderAcceptDate = new Date();

    // deliveryDate = deliveryDate.toISOString();
    // console.log("//////////////////");
    // console.log("Delivery Date : ", deliveryDate);
    // console.log("//////////////////");
    const orderExist = await orderSchema.findOne({ _id: (id) })
    if (orderExist) {
      const result = await orderSchema.updateOne({ _id: (id) }, { $set: { statusId, expectedDeliveryDate, adminRemarks, orderAcceptDate } });
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

// Status Counter for Dashboard
router.get('/statusCount', async (req, res) => {
  try {
    let orders = await orderSchema.find({ isActive: true });
    if (orders) {

      let Ord_Accept = 0;
      let Pack_num = 0;
      let Transport_num = 0;
      let Deliver_num = 0;
      let New_order = 0;
      let Cancel_Order = 0;

      for (const element of orders) {
        if (element.statusId == "673626581da86f57e77d973c") {
          New_order = New_order + 1;
        }
        else if (element.statusId == "673626631da86f57e77d973f") {
          Ord_Accept = Ord_Accept + 1;
        }
        else if (element.statusId == "673626751da86f57e77d9742") {
          Pack_num = Pack_num + 1;
        }
        else if (element.statusId == "673626851da86f57e77d9745") {
          Transport_num = Transport_num + 1;
        }
        else if (element.statusId == "673626901da86f57e77d9748") {
          Deliver_num = Deliver_num + 1;
        }
        else if (element.statusId == "67bf462e1cda1de741312dc3") {
          Cancel_Order = Cancel_Order + 1;
        }
      }

      let temp = {
        New_Orders: New_order,
        Accepted_Orders: Ord_Accept,
        Packing_Orders: Pack_num,
        Transportation_Orders: Transport_num,
        Delivery_Orders: Deliver_num,
        Cancelled_Orders: Cancel_Order
      }

      res.json({ statusCode: 200, result: { message: "Successfully Fetched Status Order Count", statusCount: temp } })
    }
  } catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Delivery List for Dashboard
router.get('/deliveryOrderDashboard', async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    let today = moment().format('YYYY-MM-DD');

    // Find orders where expectedDeliveryDate matches today's date
    let orders = await orderSchema.find({
      isActive: true,
      $or: [
        { expectedDeliveryDate: { $gte: new Date(today + "T00:00:00.000Z"), $lt: new Date(today + "T23:59:59.999Z") } },
        { deliveryDate: { $gte: new Date(today + "T00:00:00.000Z"), $lt: new Date(today + "T23:59:59.999Z") } }
      ]
      // deliveryDate: { 
      //   $gte: new Date(today + "T00:00:00.000Z"), 
      //   $lt: new Date(today + "T23:59:59.999Z") 
      // },
      // expectedDeliveryDate: { 
      //   $gte: new Date(today + "T00:00:00.000Z"), 
      //   $lt: new Date(today + "T23:59:59.999Z") 
      // }
    });

    if (orders.length > 0) {
      let newarr = [];

      for (const element of orders) {
        let customer = await customerSchema.findOne({ _id: element.customerId });
        let status = await statusSchema.findOne({ _id: element.statusId });

        let Order_date = moment(element.orderDate).format('DD-MM-YYYY');
        let Del_date = moment(element.deliveryDate).format('DD-MM-YYYY');

        let temp = {
          _id: element._id,
          customerId: element.customerId,
          statusId: element.statusId,
          paymentTypeId: element.paymentTypeId,
          customerName: customer.name,
          total: element.total,
          orderDate: Order_date,
          deliveryDate: Del_date,
          isActive: element.isActive
        };

        newarr.push(temp);
      }

      res.json({ statusCode: 200, message: "Success", result: { orders: newarr } });
    } else {
      res.json({ statusCode: 404, message: "No orders found for today's delivery" });
    }
  } catch (err) {
    res.json({ statusCode: 400, message: err.message });
  }
});

// Latest Order for Dashboard
router.get('/latestOrdersForDashboard', async (req, res) => {
  try {
    let orders = await orderSchema.find({ isActive: true }).sort({ _id: -1 }).limit(2);
    if (orders) {
      let newarr = [];
      for (const element of orders) {
        //   console.log("Inside FOR Loop");
        let customer = await customerSchema.findOne({ _id: element.customerId });
        let status = await statusSchema.findOne({ _id: element.statusId });
        let payment = await paymentSchema.findOne({ _id: element.paymentTypeId });

        let Order_date = moment(element.orderDate).format('DD-MM-YYYY');
        let Del_date = moment(element.deliveryDate).format('DD-MM-YYYY');

        let temp = {
          _id: element._id,
          customerId: element.customerId,
          statusId: element.statusId,
          paymentTypeId: element.paymentTypeId,
          customerName: customer.name,
          paymentName: payment.paymentName,
          invoiceNumber : element.invoiceNumber,
          total: element.total,
          orderDate: Order_date,
          isActive: element.isActive
        }
        newarr.push(temp);
        console.log(temp);
      }
      console.log(newarr);
      res.json({ statusCode: 200, message: "success", result: { orders: newarr } });
    }
    else {
      res.json({ statusCode: 404, message: "Orders not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Get Order By Customer Id
router.get('/orderByCustomerId/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    let orders = await orderSchema.find({ customerId: (customerId) })
    if (orders) {
      let newarr = [];
      for (const element of orders) {
        //   console.log("Inside FOR Loop");
        let customer = await customerSchema.findOne({ _id: element.customerId });
        let status = await statusSchema.findOne({ _id: element.statusId });
        let payment = await paymentSchema.findOne({ _id: element.paymentTypeId });

        let Order_date = moment(element.orderDate).format('DD-MM-YYYY');
        let Del_date = moment(element.deliveryDate).format('DD-MM-YYYY');

        let temp = {
          _id: element._id,
          customerId: element.customerId,
          statusId: element.statusId,
          paymentTypeId: element.paymentTypeId,
          invoiceNumber: element.invoiceNumber,
          customerName: customer.name,
          statusName: status.statusName,
          paymentName: payment.paymentName,
          total: element.total,
          customerRemarks: element.customerRemarks,
          adminRemarks: element.adminRemarks,
          orderDate: Order_date,
          deliveryDate: Del_date,
          isActive: element.isActive
        }
        newarr.push(temp);
        console.log(temp);
      }
      console.log(newarr);
      res.json({ statusCode: 200, message: "success", result: { orders: newarr } });
    }
    else {
      res.json({ statusCode: 404, message: "Orders not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

// Paginated Orders
router.get('/paginatedOrders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const statusFilter = req.query.status || 'all';

    // Build filter conditions
    let filterCondition = { isActive: true };
    if (statusFilter !== 'all') {
      // Find the statusId by statusName
      const status = await statusSchema.findOne({ statusName: statusFilter });
      if (status) {
        filterCondition.statusId = status._id;
      }
    }

    // Get total count for pagination metadata
    const totalOrders = await orderSchema.countDocuments(filterCondition);

    // Get orders with pagination
    let orders = await orderSchema.find(filterCondition).sort({ orderDate: -1 }).skip(skip).limit(limit);

    if (orders && orders.length > 0) {
      let newarr = [];
      for (const element of orders) {
        let customer = await customerSchema.findOne({ _id: element.customerId });
        let status = await statusSchema.findOne({ _id: element.statusId });
        let payment = await paymentSchema.findOne({ _id: element.paymentTypeId });

        let Order_date = moment(element.orderDate).format('DD-MM-YYYY');
        let Del_date = moment(element.deliveryDate).format('DD-MM-YYYY');

        let temp = {
          _id: element._id,
          customerId: element.customerId,
          statusId: element.statusId,
          paymentTypeId: element.paymentTypeId,
          invoiceNumber: element.invoiceNumber,
          customerName: customer.name,
          statusName: status.statusName,
          paymentName: payment.paymentName,
          total: element.total,
          customerRemarks: element.customerRemarks,
          adminRemarks: element.adminRemarks,
          orderDate: Order_date,
          deliveryDate: Del_date,
          isActive: element.isActive
        }
        newarr.push(temp);
      }

      res.json({
        statusCode: 200,
        message: "success",
        result: {
          orders: newarr,
          pagination: {
            totalOrders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: page,
            limit
          }
        }
      });
    } else {
      res.json({ statusCode: 404, message: "Orders not found" });
    }
  }
  catch (err) {
    res.json({ statusCode: 400, message: err.message })
  }
});

module.exports = router;