const mongoose = require('../database')

const schema = {
    customerId: String, 
    total : Number,
    statusId : String, 
    paymentTypeId: String, 
    customerRemarks : String,
    adminRemarks: String, 
    orderDate : Date,
    deliveryDate : Date,
    isActive : Boolean

  };
  
  const collectionName = "order";
  const orderSchema = mongoose.Schema(schema);
  module.exports = mongoose.model(collectionName, orderSchema);