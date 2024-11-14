const mongoose = require('../database')

const schema = {
    statusName : String, 
    isActive: Boolean
};

const collectionName = "status";
const statusSchema = mongoose.Schema(schema);
module.exports = mongoose.model(collectionName,statusSchema);