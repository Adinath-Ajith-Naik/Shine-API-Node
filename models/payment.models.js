const mongoose = require('../database')

const schema = {
    paymentType : String, 
    isActive : Boolean
}

const collectionName = "payments";
const paymentSchema = mongoose.Schema(schema);
module.exports = mongoose.model(collectionName,paymentSchema);