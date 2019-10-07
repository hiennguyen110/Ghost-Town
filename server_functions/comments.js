const mongoose = require("mongoose");
const dotenv = require("dotenv").config({
    path: "../.env"
});

mongoose.connect(process.env.DATABASE_ADDR, {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
const COMMENTS_SCHEMA = new mongoose.Schema({
    comment_author: String,
    comment_content: String,
    comment_date: String,
    comment_status: String
});

const USER_COMMENTS = mongoose.model("COMMENTS", COMMENTS_SCHEMA);

const get_all_comments = function() {
    return USER_COMMENTS.find({});
}

module.exports = {
    get_all_comments: get_all_comments,
}
