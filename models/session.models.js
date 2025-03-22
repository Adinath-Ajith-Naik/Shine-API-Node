const mongoose = require('../database')

const schema = {
    customerId : String,
    sessionToken : String,
    lastLoggedIn : String
};
  
const collectionName = "session";
const sessionSchema = mongoose.Schema(schema);
module.exports = mongoose.model(collectionName, sessionSchema);