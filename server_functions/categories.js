const mongoose = require("mongoose");
const dotenv = require("dotenv").config({
    path: "../.env"
});

mongoose.connect(process.env.DATABASE_ADDR, {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
const CATEGORY_SCHEMA = new mongoose.Schema({
    category_name: String,
    description: String,
});

const CATEGORY = new mongoose.model("GT_CATS", CATEGORY_SCHEMA);

const update_category = function(category_name, new_name) {
    return CATEGORY.findOneAndUpdate({category_name: category_name}, { $set: {category_name: new_name}});
};

const update_description = function(category_name, new_description){
  return CATEGORY.findOneAndUpdate({category_name: category_name}, {$set: {description: description}});
};

const find_category = function(category_name){
    return CATEGORY.findOne({category_name: category_name});
};

const create_new_category = function(category_name, description, callback){
    CATEGORY.insertMany([{
        category_name: category_name,
        description: description,
    }], callback);
}

const find_cat_by_id = function(catID) {
    return CATEGORY.findOne({_id: catID});
};

const getnamebyid = function(catID){
    find_cat_by_id(catID).then((result) => {
        console.log(result);
    }).catch((err) => {
        console.log(err);
    });
}

const delete_category = function(catID,fn){
    return CATEGORY.findOneAndDelete({_id: catID}, fn);
};

const get_all_categories = function(){
    return CATEGORY.find({});
};

const insert_new_category = function(category_name, cat_description, callback){
    return CATEGORY.insertMany([{
      category_name: category_name,
      description: cat_description,
    }], callback);
};

module.exports = {
    update_category: update_category,
    find_category: find_category,
    create_new_category: create_new_category,
    delete_category: delete_category,
    get_all_categories: get_all_categories,
    find_cat_by_id: find_cat_by_id,
    getnamebyid: getnamebyid,
    update_description: update_description,
    insert_new_category: insert_new_category,
};
