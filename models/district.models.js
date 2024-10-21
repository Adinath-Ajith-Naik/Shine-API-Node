const mongoose = require('../database')

const schema = {
    districtName : String,
    countryId: String,
    stateId :String,
    isActive : Boolean,

  };
  
  const collectionName = "district";
  const districtSchema = mongoose.Schema(schema);
  module.exports = mongoose.model(collectionName, districtSchema);