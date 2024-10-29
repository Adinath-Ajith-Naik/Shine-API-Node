const mongoose = require('../database')

const schema = {
    name : String, 
    email : String, 
    contactNo : String, 
    address : String, 
    pincode : String, 
    districtId: String, 
    stateId : String, 
    countryId : String,
    logoUrl : String,
    isActive: Boolean
};

const collectionName = "company";
const companySchema = mongoose.Schema(schema);
module.exports = mongoose.model(collectionName,companySchema);