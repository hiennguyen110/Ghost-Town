const mongoose = require("mongoose");
const dotenv = require("dotenv").config({
    path: "../.env"
});

mongoose.connect(process.env.POST_ADDR, {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
const USER_POST_SCHEMA = new mongoose.Schema({
    post_author: String,
    post_title: String,
    post_content: String,
    post_category: String,
    post_tags: String,
    post_comment_count: Number,
    post_date: Date
});

const USER_POST = mongoose.model("POSTS", USER_POST_SCHEMA);

const create_new_post = function(post_author, post_title, post_content, post_category, post_tags, post_comment_count, post_date){
    const new_post = new USER_POST({
        post_author: post_author,
        post_title: post_title,
        post_content: post_content,
        post_category: post_category,
        post_tags: post_tags,
        post_comment_count: post_comment_count,
        post_date: post_date
    }); 
    return new_post.save();
}

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

const delete_post_by_id = function(post_id){
    return USER_POST.deleteOne({
        _id: post_id
    });
};

const update_post_by_title = function(post_author, post_title, post_content, post_category, post_tags, post_comment_count, post_date){
    return USER_POST.updateOne({post_title: post_title}, {
        post_author: post_author,
        post_title: post_title,
        post_content: post_content,
        post_category: post_category,
        post_tags: post_tags,
        post_comment_count: post_comment_count,
        post_date: post_date
    });
};

const update_post_by_id = function(post_id, post_author, post_title, post_content, post_category, post_tags, post_comment_count, post_date){
    return USER_POST.updateOne({_id: post_id}, {
        post_author: post_author,
        post_title: post_title,
        post_content: post_content,
        post_category: post_category,
        post_tags: post_tags,
        post_comment_count: post_comment_count,
        post_date: post_date
    });
};

var post_author = "Hien Nguyen";
var post_title = "Learning Web Development";
var post_content = "Web Development has the back end in node.js";
var post_category = "C++";
var post_tags = "C++, Learning C++, C++ Development";
var post_comment_count = 10;
var post_date = "2002-12-09";

create_new_post(post_author, post_title, post_content, post_category, post_tags, post_comment_count, post_date).then((result) => {
    console.log("New post has been added to the database !!!");
}).catch((err) => {
    console.log(err);
})

module.exports = {
    create_new_post: create_new_post,
    find_post_by_id: find_post_by_id,
    find_post_by_title: find_post_by_title,
    delete_post_by_title: delete_post_by_title,
    delete_post_by_id: delete_post_by_id,
    update_post_by_title: update_post_by_title,
    update_post_by_id: update_post_by_id
}
