const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

mongoose.connect(process.env.DATABASE_API, {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
const ADMIN_ACCOUNT_INFO_SCHEMA = new mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String, 
    userEmail: String
});

const ADMIN_ACCOUNT_INFO = mongoose.model("ADMIN_INFORMATION", ADMIN_ACCOUNT_INFO_SCHEMA);

const insert_user_info = function(username, firstName, lastName, userEmail){
    const new_user = new ADMIN_ACCOUNT_INFO({
        username: username,
        firstName: firstName,
        lastName: lastName,
        userEmail: userEmail
    }); 
    return new_user.save();
}

module.exports = {
    insert_user_info: insert_user_info
}
