//jshint esversion:6

const mongoose = require("mongoose");
const dotenv = require("dotenv").config({
    path: "../.env"
});

mongoose.connect(process.env.DATABASE_ADDR, {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
const NOTIFICATION_SCHEMA = new mongoose.Schema({
  notification_owner: String,
  notification: [{
    notification_name: String,
    notification_content: String,
    seen_status: Boolean,
  }],
});

const NOTIFICATION = mongoose.model("NOTIFICATIONS", NOTIFICATION_SCHEMA);

const create_notification = function(owner, notification_name, notification_content){
    NOTIFICATION.insertMany([
      {
        notification_owner: owner,
        notification: {
          notification_name: notification_name,
          notification_content: notification_content,
          seen_status: false,
        }
      }
    ]);
};

const find_notification = function(notification_id){
  return NOTIFICATION.findOne({_id: notification_id});
};

const find_notification_by_owner = function(owner){
  return NOTIFICATION.findOne({notification_owner: owner});
};

const push_new_notification = function(owner, notification_name, notification_content){
  var new_notification = {
    notification_name: notification_name,
    notification_content: notification_content,
    seen_status: false,
  };
  find_notification_by_owner(owner).then((result) => {
    if (result != null){
      var notification_arr = [];
      result.notification.forEach(element => {
        notification_arr.push(element);
      });
      notification_arr.push(new_notification);
      return NOTIFICATION.updateOne({notification_owner: owner}, {
        notification: notification_arr,
      });
    }
  }).catch((err) => {
    console.log(err);
  });
};

const remove_notification_by_id = function(owner, notification_id){
  find_notification_by_owner(owner).then((result) => {
    if (result != null){
      var notification_arr = [];
      result.notification.forEach(element => {
        console.log(element._id);
        if (notification_id != element._id){
          notification_arr.push(element);
        }
      });
       return NOTIFICATION.updateOne({notification_owner: owner}, {
        notification: notification_arr,
      });
    }
    callback();
  }).catch((err) => {
    console.log(err);
  });
};

const remove_user_notification = function(owner, callback){
  // This function will remove all information of the user and their notification in the system
  NOTIFICATION.deleteOne({notification_owner: owner}, callback);
};

module.exports = {
  create_notification: create_notification,
  find_notification: find_notification,
  find_notification_by_owner: find_notification_by_owner,
  push_new_notification: push_new_notification,
  remove_user_notification: remove_user_notification,
  remove_notification_by_id: remove_notification_by_id,
};
