const mongoose = require('../database')

const schema = {
    categoryName : String,
    photoUrl: String,
    isActive : Boolean,
  };
  
  const collectionName = "category";
  const categorySchema = mongoose.Schema(schema);
  module.exports = mongoose.model(collectionName, categorySchema);