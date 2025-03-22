const mongoose = require('../database')

const schema = {
    mobileNo : Number,
    password : String,
    customerId : String,
    saltData : String
};
  
const collectionName = "user";
const userSchema = mongoose.Schema(schema);
module.exports = mongoose.model(collectionName, userSchema);