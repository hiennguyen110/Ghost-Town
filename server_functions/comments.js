const mongoose = require("mongoose");
const dotenv = require("dotenv").config({
    path: "../.env"
});

mongoose.connect(process.env.DATABASE_ADDR, {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
const COMMENTS_SCHEMA = new mongoose.Schema({
    post_id: String,
    comment_author: String,
    comment_content: String,
    comment_date: Date,
    comment_status: String
});

const USER_COMMENTS = mongoose.model("COMMENTS", COMMENTS_SCHEMA);

const get_all_comments = function(post_id) {
    return USER_COMMENTS.find({post_id: post_id});
};

const create_comment = function(post_id, comment_author, comment_content, callback){
    USER_COMMENTS.insertMany([{
        post_id: post_id,
        comment_author: comment_author,
        comment_content: comment_content,
        comment_date: Date.now(),
    }], callback);
};

module.exports = {
    get_all_comments: get_all_comments,
    create_comment: create_comment,
};
