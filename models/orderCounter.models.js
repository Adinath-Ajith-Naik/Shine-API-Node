const mongoose = require('../database');

const schema = {
    _id: String,
    seq: Number,
    isActive : Boolean
  };
  
  const collectionName = "orderCounter";
  const orderCounterSchema = mongoose.Schema(schema);
  module.exports = mongoose.model(collectionName, orderCounterSchema);