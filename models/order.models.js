const mongoose = require('../database')

const schema = {
    customerId: String, 
    total : Number,
    statusId : String, 
    paymentTypeId: String, 
    customerRemarks : String,
    adminRemarks: String, 
    orderDate : Date,
    orderAcceptDate : Date,
    expectedDeliveryDate : Date,
    deliveryDate : Date,
    packingDate : Date,
    transportDate : Date,
    isActive : Boolean,
    invoiceNumber : String, 

  };
  
  const collectionName = "order";
  const orderSchema = mongoose.Schema(schema);
  module.exports = mongoose.model(collectionName, orderSchema);