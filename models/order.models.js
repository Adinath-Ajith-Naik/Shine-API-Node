const mongoose = require('../database')

const schema = {
    customerId: String, 
    total : Number,
    statusId : String, 
    paymentTypeId: String, 
    remarks : String,
    orderDate : Date,
    deliveryDate : Date,
    isActive : Boolean

  };
  
  const collectionName = "order";
  const orderSchema = mongoose.Schema(schema);
  module.exports = mongoose.model(collectionName, orderSchema);