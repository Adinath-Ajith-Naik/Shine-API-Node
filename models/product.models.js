const mongoose = require('../database');

const schema = {
    productName : String, 
    price : Number,
    categoryId : String, 
    subCategoryId : String,
    companyId : String, 
    photoUrl1 : String, 
    photoUrl2 : String,
    description : String, 
    weight : String, 
    isActive : Boolean
}   

const collectionName = "products";
const productSchema = mongoose.Schema(schema);
module.exports = mongoose.model(collectionName,productSchema);