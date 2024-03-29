//jshint esversion:6

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
const worklistDatabase = require(__dirname + "/server_functions/worklist.js");
const commentsDatabase = require(__dirname + "/server_functions/comments.js");
const notificationDatabase = require(__dirname + "/server_functions/notifications.js");
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
var tags_arr = [];
var namePrefix = [];
var topic = [];
var userSymbol = [];
var notification_arr = [];

server.get("/test", function(req, res){
    res.render("page-categories-single");
});

server.get("/", function(req, res){
    if (req.isAuthenticated()){
        console.log("User is authenticated !!!");
        postDatabase.get_all_posts().then((result) => {
            topic = result.reverse();
            result.forEach(element => {
                tags_arr.push(element.post_tags.split(","));
            });
            result.forEach(element => {
                namePrefix.push("#icon-ava-" + element.post_author.charAt(0).toLowerCase());
            });
            userInfoDatabase.find_user(req.user.username).then((user) => {
              notificationDatabase.find_notification_by_owner(req.user.username).then((notification) => {
                  console.log(user);
                    userSymbol.push("#icon-ava-" + user.firstName.charAt(0).toLowerCase());
                    res.render("index", {
                        topic: result,
                        tags: tags_arr,
                        nameSymbol: namePrefix,
                        user_id: user,
                        userSymbol: userSymbol,
                    });
                    tags_arr = [];
                    namePrefix = [];
                    userSymbol = [];
              }).catch((err) => {
                 console.log(err);
              });
            }).catch((err) => {
                console.log(err);
            });
            // End of getting comment
        }).catch((err) => {
            console.log(err);
            console.log("Can not get post data !!!");
        });
    } else {
        console.log("User is not authenticated !!!");
        res.redirect("/page-login");
    }
});

server.get("/view-notifications", function(req, res){
  if (req.isAuthenticated()){
    userInfoDatabase.find_user(req.user.username).then((user) => {
      notificationDatabase.find_notification_by_owner(req.user.username).then((result) => {
        if (result != null){
            userSymbol.push("#icon-ava-" + user.firstName.charAt(0).toLowerCase());
            result.notification.forEach(element => {
              notification_arr.push(element);
            });
            res.render("notifications", {
              notifications: notification_arr,
              userSymbol: userSymbol,
              user_id: user,
            });
            notification_arr = [];
            userSymbol = [];
        } else {
            var message = "Wellcome to GhostTown, we are really to see you here :]]]";
            notificationDatabase.create_notification(req.user.username, "Wellcome to GhostTown", message);
            res.redirect("/view-notifications");
        }
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  } else {
    res.redirect("/");
  }
});

server.get("/view-notification-content", function(req, res){
    // Change the seen status to true
    if (req.isAuthenticated()){
        var notification_id = url.parse(req.url, true).query.notification_id;
        console.log(notification_id);
        notificationDatabase.find_notification_by_owner(req.user.username).then((result) => {
            userInfoDatabase.find_user(req.user.username).then((user) => {
                userSymbol.push("#icon-ava-" + user.firstName.charAt(0).toLowerCase());
                result.notification.forEach(element => {
                    if(element._id == notification_id){
                        console.log(element.notification_content);
                        res.render("view-notification-content", {
                            notification_name: element.notification_name,
                            notification_content: element.notification_content,
                            user_id: user,
                            userSymbol: userSymbol,
                        });
                    }
                });
                userSymbol = [];
            }).catch((err) => {
                console.log(err);
            });
        }).catch((err) => {
            console.log(err);
        });
    } else {
        res.redirect("/");
    }
});

server.get("/delete-notification", function(req, res){
    if (req.isAuthenticated()){
        var notification_id = url.parse(req.url, true).query.notification_id;
        console.log(notification_id);
        notificationDatabase.remove_notification_by_id(req.user.username, notification_id);
        res.redirect("/view-notifications");
    } else {
        res.redirect("/");
    }
});

var comment_prefix = [];
server.get("/view-topic", function(req, res){
    if (req.isAuthenticated()){
        var topicID = url.parse(req.url, true).query.topicID;
        postDatabase.update_view_number(topicID);
        postDatabase.find_post_by_id(topicID).then((result) => {
            tags_arr.push(result.post_tags.split(","));
            // This code in here is used to get all the comment related to this post
            commentsDatabase.get_all_comments(topicID).then((comments) => {
                userInfoDatabase.find_user(req.user.username).then((user) => {
                    comments = comments.reverse();
                    comments.forEach(element => {
                        comment_prefix.push("#icon-ava-" + element.comment_author.charAt(0).toLowerCase());
                    });
                    namePrefix.push("#icon-ava-" + result.post_author.charAt(0).toLowerCase());
                    userSymbol.push("#icon-ava-" + user.firstName.charAt(0).toLowerCase());
                    res.render("page-single-topic", {
                        topic: result,
                        tags: tags_arr,
                        comments: comments,
                        nameSymbol: namePrefix,
                        commentSymbol: comment_prefix,
                        userSymbol: userSymbol,
                        user_id: user,
                    });
                    tags_arr = [];
                    namePrefix = [];
                    comment_prefix = [];
                    userSymbol = [];
                }).catch((err) => {
                    console.log(err);
                });
           }).catch((err) => {
               console.log(err);
           });
        }).catch((err) => {
            console.log(err);
        });
    } else {
        res.redirect("/");
    }
});

server.get("/view-categories", function(req, res){
  if (req.isAuthenticated()){
    userInfoDatabase.find_user(req.user.username).then((user) => {
      categoryDatabase.get_all_categories().then((categories) => {
        userSymbol.push("#icon-ava-" + user.firstName.charAt(0).toLowerCase());
        res.render("page-categories", {
          user_id: user,
          userSymbol: userSymbol,
          categories: categories,
        });
        userSymbol = [];
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  } else {
      console.log("Access denied to administrator account !!!");
      res.redirect("/");
  }
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
    });
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
    });
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
    });
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
    if (req.isAuthenticated()){
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
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});

server.get("/admin/edit-cats", function(req, res){
    if (req.isAuthenticated()){
        var catid = url.parse(req.url, true).query.catid;
        categoryDatabase.find_cat_by_id(catid).then((result) => {
            console.log(result);
            old_category_name = result.category_name;
            res.redirect("/admin/view-category");
        }).catch((err) => {
            console.log(err);
            console.log("Can not find the name of category by ID");
        });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});

server.post("/admin/edit-cats", function(req, res){
    if (req.isAuthenticated()){
        var catName = req.body.new_category_name;
        categoryDatabase.update_category(old_category_name, catName).then((result) => {
            console.log("Category name has been updated !!!");
            old_category_name = "";
            res.redirect("/admin/view-category");
        }).catch((err) => {
            console.log(err);
            console.log("Can not update category !!!");
        });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});

server.get("/admin/delete-cats", function(req, res){
    if (req.isAuthenticated()){
        var catid = url.parse(req.url, true).query.catid;
        categoryDatabase.delete_category(catid).then((result) => {
            res.redirect("/admin/view-category");
        }).catch((err) => {
            console.log(err);
        });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});

server.post("/admin/add-category", function(req, res){
    if (req.isAuthenticated()){
        console.log("Adding new category");
        var new_category = req.body.new_category;
        var cat_description = req.body.cat_description;
        categoryDatabase.find_category(new_category).then((result) => {
            if (result == null){
                categoryDatabase.insert_new_category(new_category, cat_description, () => {
                  console.log("Adding catergory");
                  res.redirect("/admin/view-category");
                });
            } else {
                res.send("Duplicated Category !!!");
            }
        }).catch((err) => {
            console.log(err);
        });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});
// End of categories

// Posts
server.get("/admin/show-all-posts", function(req, res){
    if (req.isAuthenticated()){
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
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});

server.get("/admin/approve-post", function(req, res){
    if (req.isAuthenticated()){
        var postID = url.parse(req.url, true).query.postid;
        console.log("Approving post contain id: " + postID);
        postDatabase.approve_post(postID, () => {
            console.log("Post has been approved !!!");
            res.redirect("/admin/show-all-posts");
        });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});

server.get("/admin/disapprove-post", function(req, res){
    if (req.isAuthenticated()){
        var postID = url.parse(req.url, true).query.postid;
        console.log("Disapproving post contain id: " + postID);
        postDatabase.disapprove_post(postID, () => {
            console.log("Post has been disapproved !!!");
            res.redirect("/admin/show-all-posts");
        });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});

server.get("/admin/delete-post", function(req, res){
    if (req.isAuthenticated()){
        var postID = url.parse(req.url, true).query.postid;
        console.log("Deleting post contain id: " + postID);
        postDatabase.delete_post_by_id(postID, () => {
            console.log("Post has been deleted !!!");
            res.redirect("/admin/show-all-posts");
        });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});

// Create new topic
server.get("/add-post", function(req, res){
    if (req.isAuthenticated()){
      userInfoDatabase.find_user(req.user.username).then((user) => {
        categoryDatabase.get_all_categories().then((categories) => {
          userSymbol.push("#icon-ava-" + user.firstName.charAt(0).toLowerCase());
          res.render("page-create-topic", {
            user_id: user,
            userSymbol: userSymbol,
            categories: categories,
          });
          userSymbol = [];
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/");
    }
});

server.get("/admin/add-post", function(req, res){
    if (req.isAuthenticated()){
        res.redirect("/add-post");
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});

server.post("/add-post", function(req, res){
    if (req.isAuthenticated()){
        var post_author = req.user.username;
        var post_title = req.body.post_title;
        var post_content = req.body.post_content;
        var post_category = req.body.post_category;
        var post_tags = req.body.post_tags;
        var post_comment_count = 0;
        var post_status = "negative";
        var post_date = Date.now();
        postDatabase.create_new_post(post_author, post_title, post_content, post_category, post_tags, post_comment_count, post_status, post_date).then((result) => {
            res.redirect("/");
        }).catch((err) => {
            console.log(err);
        });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/");
    }
});
// End of posts

// User
var profileid = "";
server.get("/user-peofile", function(req, res){
    if (req.isAuthenticated()){
        profileid = url.parse(req.url, true).query.profileid;
        console.log(profileid);
        userInfoDatabase.get_user_info(profileid).then((result) => {
            res.render("user-profile", {
                user_data: result,
            });
        }).catch((err) => {
            console.log(err);
            console.log("Can not get client information !!!");
        });
    } else {
        console.log("Access denied to client account");
        res.redirect("/");
    }
});

server.post("/user-profile", function(req, res){
    if (req.isAuthenticated()){
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var userEmail = req.body.userEmail;
        userInfoDatabase.update_user(profileid, firstName, lastName, userEmail).then((result) => {
            res.redirect("/");
        }).catch((err) => {
            console.log(err);
        });
    } else {
        console.log("Access denied to client account");
        res.redirect("/");
    }
});

server.get("/admin/view-users", function(req, res){
    if (req.isAuthenticated()){
        console.log("Rendering user main page !!!");
        userInfoDatabase.get_all_users().then((result) => {
            if (result != null){
                res.render("admin/users", {
                    users: result,
                });
            }
        }).catch((err) => {
            console.log(err);
            console.log("Can not find all user !!!");
        });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});

server.get("/admin/remove-user", function(req, res){
    if (req.isAuthenticated()){
        var userID = url.parse(req.url, true).query.userid;
        userInfoDatabase.remove_user(userID, () => {
            res.redirect("/admin/view-users");
        });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});
// End of user

// Working list
server.get("/admin/view-worklist", function(req, res) {
    if (req.isAuthenticated()){
        var userID = url.parse(req.url, true).query.userid;
        worklistDatabase.get_all_works(req.user.username).then((result) => {
            if (result.length != 0){
                worklistDatabase.remove_work(req.user.username, "Woohoo, nothing is gonna due soon !!!", () => {
                    var working_list = result[0].working_list;
                    res.render("admin/worklist", {
                        worklist: working_list,
                    });
                });
            } else {
                worklistDatabase.create_new_working_list(req.user.username, "Woohoo, nothing is gonna due soon !!!", () => {
                    res.redirect("/admin/view-worklist");
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});

server.post("/admin/add-work", function(req, res){
    var new_work = req.body.new_work;
    worklistDatabase.create_new_working_list(req.user.username, new_work, () => {
        res.redirect("/admin/view-worklist");
    });

});
// End of worklist

// Comments
post_link = [];
server.get("/admin/view-comments", function(req, res){
    if (req.isAuthenticated()){
        commentsDatabase.get_comments().then((result) => {
          result.forEach(element => {
            post_link.push(element.post_id);
          });
          res.render("admin/comments", {
            comments: result,
            post_link: post_link,
          });
          post_link = [];
        }).catch((err) => {
          console.log(err);
          console.log("Can not get comments for administrator");
        });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/admin-login");
    }
});

server.get("/admin/approve-comment", function(req, res){
  if (req.isAuthenticated()){
      var commentId = url.parse(req.url, true).query.commentid;
      commentsDatabase.approve_comment(commentId, () => {
        res.redirect("/admin/view-comments");
      });
  } else {
      console.log("Access denied to administrator account !!!");
      res.redirect("/admin-login");
  }
});

server.get("/admin/disapprove-comment", function(req, res){
  if (req.isAuthenticated()){
      var commentId = url.parse(req.url, true).query.commentid;
      commentsDatabase.disapprove_comment(commentId, () => {
        res.redirect("/admin/view-comments");
      });
  } else {
      console.log("Access denied to administrator account !!!");
      res.redirect("/admin-login");
  }
});

server.get("/admin/delete-comment", function(req, res){
  if (req.isAuthenticated()){
      var commentId = url.parse(req.url, true).query.commentid;
      commentsDatabase.remove_comment(commentId, () => {
        res.redirect("/admin/view-comments");
      });
  } else {
      console.log("Access denied to administrator account !!!");
      res.redirect("/admin-login");
  }
});

server.get("/gotopost", function(req, res){
  if (req.isAuthenticated()){
      var topicID = url.parse(req.url, true).query.postid;
      postDatabase.find_post_by_id(topicID).then((result) => {
          tags_arr.push(result.post_tags.split(","));
          // This code in here is used to get all the comment related to this post
          commentsDatabase.get_all_comments(topicID).then((comments) => {
              userInfoDatabase.find_user(req.user.username).then((user) => {
                  comments = comments.reverse();
                  comments.forEach(element => {
                      comment_prefix.push("#icon-ava-" + element.comment_author.charAt(0).toLowerCase());
                  });
                  namePrefix.push("#icon-ava-" + result.post_author.charAt(0).toLowerCase());
                  userSymbol.push("#icon-ava-" + user.firstName.charAt(0).toLowerCase());
                  res.render("page-single-topic", {
                      topic: result,
                      tags: tags_arr,
                      comments: comments,
                      nameSymbol: namePrefix,
                      commentSymbol: comment_prefix,
                      userSymbol: userSymbol,
                      user_id: user,
                  });
                  tags_arr = [];
                  namePrefix = [];
                  comment_prefix = [];
                  userSymbol = [];
              }).catch((err) => {
                  console.log(err);
              });
         }).catch((err) => {
             console.log(err);
         });
      }).catch((err) => {
          console.log(err);
      });
  } else {
      console.log("Access denied to administrator account !!!");
      res.redirect("/admin-login");
  }
});

server.post("/add-reply-to-topic", function(req, res){
    if (req.isAuthenticated()){
        var comment_content = req.body.comment_content;
        var topicid = url.parse(req.url, true).query.topicid;
        commentsDatabase.create_comment(topicid, req.user.username, comment_content, () => {
            console.log("New comment has been added !!!");
            postDatabase.update_comment_number(topicid);
            postDatabase.find_post_by_id(topicid).then((result) => {
                tags_arr.push(result.post_tags.split(","));
                // This code in here is used to get all the comment related to this post
                commentsDatabase.get_all_comments(topicid).then((comments) => {
                    userInfoDatabase.find_user(req.user.username).then((user) => {
                        comments = comments.reverse();
                        comments.forEach(element => {
                            comment_prefix.push("#icon-ava-" + element.comment_author.charAt(0).toLowerCase());
                        });
                        namePrefix.push("#icon-ava-" + result.post_author.charAt(0).toLowerCase());
                        userSymbol.push("#icon-ava-" + user.firstName.charAt(0).toLowerCase());
                        res.render("page-single-topic", {
                            topic: result,
                            tags: tags_arr,
                            comments: comments,
                            nameSymbol: namePrefix,
                            commentSymbol: comment_prefix,
                            userSymbol: userSymbol,
                            user_id: user,
                        });
                        tags_arr = [];
                        namePrefix = [];
                        comment_prefix = [];
                        userSymbol = [];
                    }).catch((err) => {
                        console.log(err);
                    });
               }).catch((err) => {
                   console.log(err);
               });
            }).catch((err) => {
                console.log(err);
            });
        });
    } else {
        console.log("Access denied to administrator account !!!");
        res.redirect("/");
    }
});
// End of comments

// Admin profile
server.get("/admin/view-profile", function(req, res){
  if (req.isAuthenticated()){
      var admin_username = req.user.username;
      userInfoDatabase.get_admin_user(admin_username).then((result) => {
        res.render("admin/profile", {
          admin_data: result,
        });
      }).catch((err) => {
        console.log(err);
      });
  } else {
      console.log("Access denied to administrator account !!!");
      res.redirect("/admin-login");
  }
});

server.post("/admin/change-profile", function(req, res){
  if (req.isAuthenticated()){
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var userEmail = req.body.userEmail;
    userInfoDatabase.update_admin(req.user.username, firstName, lastName, userEmail).then((result) => {
        res.redirect("/admin/view-profile");
    }).catch((err) => {
        console.log(err);
    });
  } else {
      console.log("Access denied to administrator account !!!");
      res.redirect("/admin-login");
  }
});

// End of admin profile

// GhostTown News
server.get("/admin/gt-news", function(req, res){
  if (req.isAuthenticated()){
    res.render("admin/gt_news", {

    });
  } else {
    console.log("Access denied to administrator account !!!");
    res.redirect("/admin-login");
  }
});
// End of GhostTown News

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
