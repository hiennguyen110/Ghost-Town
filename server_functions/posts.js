//jshint esversion:6

const mongoose = require("mongoose");
const dotenv = require("dotenv").config({
    path: "../.env"
});

mongoose.connect(process.env.DATABASE_ADDR, {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
const USER_POST_SCHEMA = new mongoose.Schema({
    post_author: String,
    post_title: String,
    post_content: String,
    post_category: String,
    post_tags: String,
    post_comment_count: Number,
    post_status: String,
    post_date: Date,
    post_like: Number,
    post_view: Number,
});

const USER_POST = mongoose.model("POSTS", USER_POST_SCHEMA);

const create_new_post = function(post_author, post_title, post_content, post_category, post_tags, post_comment_count, post_status, post_date){
    const new_post = new USER_POST({
        post_author: post_author,
        post_title: post_title,
        post_content: post_content,
        post_category: post_category,
        post_tags: post_tags,
        post_comment_count: post_comment_count,
        post_status: post_status,
        post_date: post_date,
        post_like: 0,
        post_view: 0,
    });
    console.log("post created !!!");
    return new_post.save();
};

const update_like_number = function(postid){
  find_post_by_id(postid).then((result) => {
    var likeNumber = result.post_like;
    likeNumber = likeNumber + 1;
    return USER_POST.updateOne({_id: postid}, {
      post_like: likeNumber,
    });
  }).catch((err) => {
    console.log(err);
  });
};

const update_view_number = function(postid){
  find_post_by_id(postid).then((result) => {
    var viewNumber = result.post_view;
    viewNumber = viewNumber + 1;
    console.log("updating view number !!!");
    return USER_POST.updateOne({_id: postid}, {
      post_view: viewNumber,
    });
  }).catch((err) => {
    console.log(err);
  });
};

const update_comment_number = function(postid){
  find_post_by_id(postid).then((result) => {
    var commentNumber = result.post_comment_count;
    commentNumber = commentNumber + 1;
    return USER_POST.updateOne({_id: postid}, {
      post_comment_count: commentNumber,
    });
  }).catch((err) => {
    console.log(err);
  });
};

const find_post_by_id = function(post_id){
    return USER_POST.findOne({_id: post_id});
};

const find_post_by_title = function(post_title){
    return USER_POST.findOne({post_title: post_title});
};

const delete_post_by_title = function(post_title){
    return USER_POST.deleteOne({
        post_title: post_title,
    });
};

const delete_post_by_id = function(post_id, callback){
    return USER_POST.deleteOne({
        _id: post_id
    }, callback);
};

const update_post_by_title = function(post_author, post_title, post_content, post_category, post_tags, post_comment_count, post_status, post_date){
    return USER_POST.updateOne({post_title: post_title}, {
        post_author: post_author,
        post_title: post_title,
        post_content: post_content,
        post_category: post_category,
        post_tags: post_tags,
        post_comment_count: post_comment_count,
        post_status: post_status,
        post_date: post_date
    });
};

const update_post_by_id = function(post_id, post_author, post_title, post_content, post_category, post_tags, post_comment_count, post_status, post_date){
    return USER_POST.updateOne({_id: post_id}, {
        post_author: post_author,
        post_title: post_title,
        post_content: post_content,
        post_category: post_category,
        post_tags: post_tags,
        post_comment_count: post_comment_count,
        post_status: post_status,
        post_date: post_date
    });
};

const get_all_posts = function() {
    return USER_POST.find({});
}

const approve_post = function(post_id, callback) {
    USER_POST.updateOne({
        _id: post_id,
    }, {post_status: "positive"}, callback);
}

const disapprove_post = function(post_id, callback) {
    USER_POST.updateOne({
        _id: post_id,
    }, {post_status: "negative"}, callback);
}

module.exports = {
    create_new_post: create_new_post,
    find_post_by_id: find_post_by_id,
    find_post_by_title: find_post_by_title,
    delete_post_by_title: delete_post_by_title,
    delete_post_by_id: delete_post_by_id,
    update_post_by_title: update_post_by_title,
    update_post_by_id: update_post_by_id,
    get_all_posts: get_all_posts,
    approve_post: approve_post,
    disapprove_post: disapprove_post,
    update_like_number: update_like_number,
    update_view_number: update_view_number,
    update_comment_number: update_comment_number,
};
