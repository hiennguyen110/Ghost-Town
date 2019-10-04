const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

mongoose.connect("mongodb+srv://patsdatabase:52435798H$a@patskahootdbs-irwee.gcp.mongodb.net/CONTENT?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
const CATEGORY_SCHEMA = new mongoose.Schema({
    category_name: String,
});

const CATEGORY = new mongoose.model("GT_CATS", CATEGORY_SCHEMA);

const update_category = function(category_name, new_name) {
    return CATEGORY.findOneAndUpdate({category_name: category_name}, { $set: {category_name: new_name}});
};

const find_category = function(category_name){
    return CATEGORY.findOne({category_name: category_name});
};

const create_new_category = function(category_name) {
    find_category(category_name).then((result) => {
        if (result == null){
            const category = new CATEGORY({
                category_name: category_name
            });
            console.log("New category has been added !!!");
            return category.save();
        } else {
            console.log("This category is already in the database !!!");
            return -1;
        }
    }).catch((err) => {
        console.log(err);
        console.log("Can not create new category !!!");
    });
};

const find_cat_by_id = function(catID) {
    return CATEGORY.findOne({_id: catID});
};

const delete_category = function(catID){
    find_cat_by_id(catID).then((result) => {
        if (result != null){
            return CATEGORY.deleteOne({_id: catID});
        } else {
            console.log("Category is not in the database !!!");
        }
    }).catch((err) => {
        console.log(err);
        console.log("Can not delete the category !!!");
    });
};

const get_all_categories = function(){
    return CATEGORY.find({});
};

module.exports = {
    update_category: update_category,
    find_category: find_category,
    create_new_category: create_new_category,
    delete_category: delete_category,
    get_all_categories, get_all_categories,
}
