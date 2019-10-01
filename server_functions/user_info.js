const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

mongoose.connect(process.env.DATABASE_API, {useNewUrlParser: true, useUnifiedTopology: true });
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
}

const find_user = function(username){
    return USER_ACCOUNT_INFO.findOne({username: username});
}

module.exports = {
    insert_user_info: insert_user_info,
    find_user: find_user
}
