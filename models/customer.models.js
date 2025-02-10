const mongoose = require('../database')

const schema={
    name: String,
    mobileNo :String,
    email : String, 
    address : String, 
    pincode : String, 
    countryId : String,
    stateId : String, 
    districtId : String, 
    isActive : Boolean,
};

const collectionName = "customer";
const customerSchema = mongoose.Schema(schema);
module.exports = mongoose.model(collectionName,customerSchema);