const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const userInfoDatabase = require(__dirname + "/server_functions/user_info.js");
const adminInfoDatabase = require(__dirname + "/server_functions/superuser.js");
const dotenv = require("dotenv").config();
const path = require("path");

const server = express();
server.set("view engine", "ejs");
server.set('admin', path.join(__dirname, '/views/'));
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

mongoose.connect(process.env.DATABASE_API, {useNewUrlParser: true, useUnifiedTopology: true });
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

server.get("/admin", function(req, res){
    if (req.isAuthenticated()){
        console.log("Gain access to administrator account !!!");
        res.render("admin/index");
    } else {
        console.log("Access denied to administrator account !!!");
        res.send("Administrator Access Denied !!!");
    }
});

server.get("/admin/chart", function(req, res){
    res.render("admin/chart");
});

server.get("/admin/table", function(req, res){
    res.render("admin/table");
});

server.get("/admin/form", function(req, res){
    res.render("admin/form");
});

server.get("/admin/calendar", function(req, res){
    res.render("admin/calendar");
});

server.get("/admin/map", function(req, res){
    res.render("admin/map");
});

// End of Admin field

server.listen(process.env.PORT || 3000, function(req, res){
    console.log("GhostTown is now on port 3000");
});