const mongoose = require("mongoose");
const dotenv = require("dotenv").config({
    path: "../.env"
});

mongoose.connect(process.env.DATABASE_ADDR, {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
const WORKLIST_SCHEMA = new mongoose.Schema({
    owner: String,
    working_list: Array,
});

const WORKLIST = mongoose.model("WORKLIST", WORKLIST_SCHEMA);

const get_all_works = function(owner){
    return WORKLIST.find({owner: owner});
}

const find_owner = function(name_of_owner){
    return WORKLIST.findOne({owner: name_of_owner});
}

const create_new_working_list = function(name_of_owner, new_work, callback){
    find_owner(name_of_owner).then((result) => {
        if (result == null) {
            WORKLIST.insertMany([{
                owner: name_of_owner,
                working_list: new_work
            }], callback);
        } else {
            add_new_work(name_of_owner, new_work).then((result) => {
                console.log("New working list has been added to you " + name_of_owner);
            }).catch((err) => {
                console.log(err);
            });
            callback();
        }
    }).catch((err) => {
        console.log(err);
        console.log("Can not create new working list !!!");
        callback();
    });
};

const add_new_work = function(name_of_owner, new_work){
    return WORKLIST.updateOne({owner: name_of_owner}, {
        $push: {working_list: new_work}
    });
}

const remove_work = function(name_of_owner, completed_work, callback){
    find_owner(name_of_owner).then((result) => {
        if (result != null){
            return WORKLIST.updateOne({owner: name_of_owner}, {
                $pull: {working_list: {$in: [completed_work]}}
            });
        } else {
            console.log("This owner is not in the system !!!");
        }
    }).catch((err) => {
        console.log(err);
        console.log("Can not remove the work !!!");
    });
    callback();
}

module.exports = {
    get_all_works: get_all_works,
    remove_work: remove_work,
    create_new_working_list: create_new_working_list,
}




