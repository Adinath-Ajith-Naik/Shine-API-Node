const mongoose = require('../database')

const schema = {
    stateName : String,
    countryId: String,
  };
  
  const collectionName = "state";
  const stateSchema = mongoose.Schema(schema);
  module.exports = mongoose.model(collectionName, stateSchema);