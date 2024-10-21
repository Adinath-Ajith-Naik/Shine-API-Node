const mongoose = require('../database')

const schema = {
    countryName : String,
    isActive : Boolean,
  };
  
  const collectionName = "country";
  const countrySchema = mongoose.Schema(schema);
  module.exports = mongoose.model(collectionName, countrySchema);