const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

mongoose.connect(process.env.DATABASE_ADDR, {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
const USER_ACCOUNT_INFO_SCHEMA = new mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    userEmail: String,
    userRole: String
});

const USER_ACCOUNT_INFO = mongoose.model("USER_INFORMATION", USER_ACCOUNT_INFO_SCHEMA);

const insert_user_info = function(username, firstName, lastName, userEmail, userRole){
    const new_user = new USER_ACCOUNT_INFO({
        username: username,
        firstName: firstName,
        lastName: lastName,
        userEmail: userEmail,
        userRole: userRole
    });
    return new_user.save();
};

const find_user = function(username){
    return USER_ACCOUNT_INFO.findOne({username: username});
};

const get_all_users = function(){
    return USER_ACCOUNT_INFO.find({});
};

const remove_user = function(userID, callback){
    return USER_ACCOUNT_INFO.deleteOne({
        _id: userID,
    }, callback);
};

const get_user_info = function(userID){
    return USER_ACCOUNT_INFO.findOne({_id: userID});
};

const update_user = function(userid, firstName, lastName, userEmail){
    return USER_ACCOUNT_INFO.findOneAndUpdate({_id: userid}, {
        firstName: firstName,
        lastName: lastName,
        userEmail: userEmail,
    });
};

const get_admin_user = function(username) {
  return USER_ACCOUNT_INFO.findOne({
    username: username,
    userRole: "admin",
  });
};

const update_admin = function(username, firstName, lastName, userEmail){
  return USER_ACCOUNT_INFO.findOneAndUpdate({username: username}, {
    firstName: firstName,
    lastName: lastName,
    userEmail: userEmail,
  });
};

module.exports = {
    insert_user_info: insert_user_info,
    find_user: find_user,
    get_all_users: get_all_users,
    remove_user: remove_user,
    get_user_info: get_user_info,
    update_user: update_user,
    get_admin_user: get_admin_user,
    update_admin: update_admin,
}
