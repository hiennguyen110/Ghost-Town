//jshint esversion:6

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
    return USER_COMMENTS.find({post_id: post_id, comment_status: "positive"});
};

const create_comment = function(post_id, comment_author, comment_content, comment_date, callback){
    USER_COMMENTS.insertMany([{
        post_id: post_id,
        comment_author: comment_author,
        comment_content: comment_content,
        comment_date: Date.now(),
        comment_status: "positive",
    }], callback);
};

const get_comments = function() {
  return USER_COMMENTS.find({});
};

const approve_comment = function(commentId, callback){
  return USER_COMMENTS.updateOne({_id: commentId}, {
    comment_status: "positive",
  }, callback);
};

const disapprove_comment = function(commentId, callback){
  return USER_COMMENTS.updateOne({_id: commentId}, {
    comment_status: "negative",
  }, callback);
};

const remove_comment = function(commentId, callback){
  return USER_COMMENTS.deleteOne({_id: commentId}, callback);
};

module.exports = {
    get_all_comments: get_all_comments,
    create_comment: create_comment,
    get_comments: get_comments,
    approve_comment: approve_comment,
    disapprove_comment: disapprove_comment,
    remove_comment: remove_comment,
};
