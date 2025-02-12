const mongoose = require('../database')

const schema = {
    productId: String, 
    orderId : String, 
    quantity: Number, 
    amount : Number,
    total : Number,
    isActive : Boolean

  };
  
  const collectionName = "orderDetails";
  const orderDetailsSchema = mongoose.Schema(schema);
  module.exports = mongoose.model(collectionName, orderDetailsSchema);