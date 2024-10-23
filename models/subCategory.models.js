const mongoose = require('../database')

const schema = {
    subCategoryName : String,
    photoUrl : String, 
    categoryId : String,
    isActive : Boolean
};

const collectionName = "subCategory";
const subCategorySchema = mongoose.Schema(schema);
module.exports = mongoose.model(collectionName,subCategorySchema);