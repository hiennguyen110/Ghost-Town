const express = require("express");
const url = require("url");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const userInfoDatabase = require(__dirname + "/server_functions/user_info.js");
const categoryDatabase = require(__dirname + "/server_functions/categories.js");
const postDatabase = require(__dirname + "/server_functions/posts.js");
const dotenv = require("dotenv").config();
const path = require("path");

const server = express();
server.set("view engine", "ejs");
server.use(bodyParser.urlencoded({extended: true}));
server.use(express.static("public"));

// Passport
server.use(session({
    secret: "sessionsecret",
    resave: false,
    saveUninitialized: false
}));

server.use(passport.initialize());
server.use(passport.session());

mongoose.connect(process.env.DATABASE_ADDR, {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
const USER_ACCOUNT_LOGIN_SCHEMA = new mongoose.Schema({
    username: String,
    password: String,
});
USER_ACCOUNT_LOGIN_SCHEMA.plugin(passportLocalMongoose);

const USER_ACCOUNT_LOGIN = mongoose.model("USER_LOGIN", USER_ACCOUNT_LOGIN_SCHEMA);

passport.use(USER_ACCOUNT_LOGIN.createStrategy());
passport.serializeUser(USER_ACCOUNT_LOGIN.serializeUser());
passport.deserializeUser(USER_ACCOUNT_LOGIN.deserializeUser());

// End of passport

server.get("/", function(req, res){
    if (req.isAuthenticated()){
        console.log("User is authenticated !!!");
        res.render("index");
    } else {
        console.log("User is not authenticated !!!");
        res.redirect("/page-login");
    }
});

server.post("/", function(req, res){
    res.render("index");
});

server.get("/page-signup", function(req, res){
    res.render("page-signup");
});

server.post("/page-signup", function(req, res){
    USER_ACCOUNT_LOGIN.register({username: req.body.username}, req.body.password, function(err, user){
        if (err){
            console.log(err);
            if (err.name == "UserExistsError"){
                console.log("Username is already taken !!!");
                res.redirect("/page-signup");
            } else {
                res.redirect("/page-signup");      
            }
        } else {
            var username = req.body.username;
            var firstName = req.body.firstName;
            var lastName = req.body.lastName;
            var userEmail = req.body.userEmail;
            var userRole = "client";
            userInfoDatabase.insert_user_info(username, firstName, lastName, userEmail, userRole).then((result) => {
                console.log("New user has been created !!!");
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/");
                });
            }).catch((err) => {
                console.log(err);
                console.log("Can not created new user record !!!");
                res.redirect("/page-signup");
            });
        }
    })
});

server.get("/page-login", function(req, res){
    if (req.isAuthenticated()){
        res.redirect("/");
    } else {
        res.render("page-login");
    }
});

server.post("/page-login", function(req, res){
    const user = new USER_ACCOUNT_LOGIN({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err){
        if (err){
            console.log(err);
        } else {
            passport.authenticate("local", {failureRedirect: '/bad-credential'})(req, res, function(){
                res.redirect("/");
            });
        }
    });
});

server.get("/bad-credential", function(req, res){
    console.log("Access denied !!!");
    res.render("page-login");
});

server.get("/page-logout", function(req, res){
    req.logOut();
    res.redirect("/");
});







// Admin field
server.get("/admin", function(req, res){
    if (req.isAuthenticated()){
        console.log("Gain access to administrator account !!!");
        res.render("admin/index");
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});

server.get("/admin-signup", function(req, res){
    res.render("admin-signup");
});

server.post("/admin-signup", function(req, res){
    USER_ACCOUNT_LOGIN.register({username: req.body.username}, req.body.password, function(err, user){
        if (err){
            console.log(err);
            if (err.name == "UserExistsError"){
                console.log("Username is already taken !!!");
                res.redirect("/page-signup");
            } else {
                res.redirect("/page-signup");      
            }
        } else {
            var username = req.body.username;
            var firstName = req.body.firstName;
            var lastName = req.body.lastName;
            var userEmail = req.body.userEmail;
            var userRole = "admin";
            userInfoDatabase.insert_user_info(username, firstName, lastName, userEmail, userRole).then((result) => {
                console.log("New user has been created !!!");
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/admin");
                });
            }).catch((err) => {
                console.log(err);
                console.log("Can not created new user record !!!");
                res.redirect("/admin-signup");
            });
        }
    })
});

server.get("/admin-login", function(req, res){
    res.render("admin-login");
});

server.post("/admin-login", function(req, res){
    console.log("Logging in administrator account !!!");
    userInfoDatabase.find_user(req.body.username).then((result) => {
        console.log(result);
        if (result.userRole != null){
            if (result.userRole == "admin"){
                const user = new USER_ACCOUNT_LOGIN({
                    username: req.body.username,
                    password: req.body.password
                });
                req.login(user, function(err){
                    if (err){
                        console.log(err);
                    } else {
                        passport.authenticate("local", {failureRedirect: '/bad-admin-credential'})(req, res, function(){
                            res.redirect("/admin");
                        });
                    }
                });
            } else {
                res.send("You do no have access to this page !!!");
            }
        } else {
            res.send("Can not find user !!!");
        }
    }).catch((err) => {
        console.log(err);
    })
});

server.get("/bad-admin-credential", function(req, res){
    res.send("Bad administrator credential !!!");
});

server.get("/admin-logout", function(req, res){
    console.log("Logging out of administrator !!!");
    req.logOut();
    res.redirect("/admin");
});

// End of Admin field

// Category
old_category_name = "";
server.get("/admin/view-category", function(req, res){
    categoryDatabase.get_all_categories().then((result) => {
        if (result != null){
            res.render("admin/gt-categories", {
                categories: result,
                new_category_name: old_category_name
            });
        } else {
            console.log("Empty category database !!!");
        }
    }).catch((err) => {
        console.log(err);
        console.log("Can not load the server category !!!");
    });
});

server.get("/admin/edit-cats", function(req, res){
    var catid = url.parse(req.url, true).query.catid;
    categoryDatabase.find_cat_by_id(catid).then((result) => {
        console.log(result);
        old_category_name = result.category_name;
        res.redirect("/admin/view-category");
    }).catch((err) => {
        console.log(err);
        console.log("Can not find the name of category by ID");
    });
});

server.post("/admin/edit-cats", function(req, res){
    var catName = req.body.new_category_name;
    categoryDatabase.update_category(old_category_name, catName).then((result) => {
        console.log("Category name has been updated !!!");
        old_category_name = "";
        res.redirect("/admin/view-category");
    }).catch((err) => {
        console.log(err);
        console.log("Can not update category !!!");
    });
});

server.get("/admin/delete-cats", function(req, res){
    var catid = url.parse(req.url, true).query.catid;
    categoryDatabase.delete_category(catid).then((result) => {
        res.redirect("/admin/view-category");
    }).catch((err) => {
        console.log(err);
    })
});

server.post("/admin/add-category", function(req, res){
    console.log("Adding new category");
    var new_category = req.body.new_category;
    categoryDatabase.find_category(new_category).then((result) => {
        if (result == null){
            categoryDatabase.create_new_category(new_category,() =>{
                res.redirect("/admin/view-category");
            });
        } else {
            res.send("Duplicated Category !!!");
        }
    }).catch((err) => {
        console.log(err);
    });
});
// End of categories

// Posts
server.get("/admin/show-all-posts", function(req, res){
    console.log("Rendering post main page !!!");
    postDatabase.get_all_posts().then((result) => {        
        if (result != null){
            res.render("admin/posts", {
                post: result,
            });
        }
    }).catch((err) => {
        console.log(err);
        console.log("Can not get all posts !!!");
    });
});

server.get("/admin/approve-post", function(req, res){
    var postID = url.parse(req.url, true).query.postid;
    console.log("Approving post contain id: " + postID);
    postDatabase.approve_post(postID, () => {
        console.log("Post has been approved !!!");
        res.redirect("/admin/show-all-posts");
    });
});

server.get("/admin/disapprove-post", function(req, res){
    var postID = url.parse(req.url, true).query.postid;
    console.log("Disapproving post contain id: " + postID);
    postDatabase.disapprove_post(postID, () => {
        console.log("Post has been disapproved !!!");
        res.redirect("/admin/show-all-posts");
    });
});

server.get("/admin/delete-post", function(req, res){
    var postID = url.parse(req.url, true).query.postid;
    console.log("Deleting post contain id: " + postID);
    postDatabase.delete_post_by_id(postID, () => {
        console.log("Post has been deleted !!!");
        res.redirect("/admin/show-all-posts");
    });
});

// Create new topic
server.get("/add-post", function(req, res){
    categoryDatabase.get_all_categories().then((result) => {
        if (result != null){
            res.render("page-create-topic", {
                categories: result
            });
        } else {
            console.log("Empty category database !!!");
        }
    }).catch((err) => {
        console.log(err);
        console.log("Can not load the server category !!!");
    });
});

server.get("/admin/add-post", function(req, res){
    res.redirect("/add-post");
});

server.post("/add-post", function(req, res){
    var post_author = req.body.post_author;
    var post_title = req.body.post_title;
    var post_content = req.body.post_content;
    var post_category = req.body.post_category;
    var post_tags = req.body.post_tags;
    var post_comment_count = 0;
    var post_status = "negative";
    var post_date = Date.now();
    create_new_post(post_author, post_title, post_content, post_category, post_tags, post_comment_count, post_status, post_date);
});

// End of posts












// 404 Error Page
server.get("/404/404-pagenotfound", function(req, res){
    res.render("404/404");
});

server.get("*", function(req, res){
    res.redirect("/404/404-pagenotfound");
});
// End of 404 page

server.listen(process.env.PORT || 3000, function(req, res){
    console.log("GhostTown is now on port 3000");
});