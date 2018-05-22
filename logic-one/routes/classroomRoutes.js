const router = require("express").Router();
const classroomModel = require("../models/classroomModel");
const userModel = require("../models/userModel");
const exerciseModel = require("../models/exerciseModel");
const middleware = require("./middleware");

router.get("/classroom/create", middleware.checkLogin, function(req, res) {
    res.render("createClassroom.ejs");
});

router.post("/classroom/create", middleware.checkLogin, function(req, res) {

    if (req.body.name == "") req.body.name = "Untitled Classroom";

    var classroom = new classroomModel({ name: req.body.name, instructor: req.session.userid });

    req.body.assignments.forEach(function(exercises) {
        classroom.assignments.push({ exercises: exercises });
    });

    classroom.save()
        .then(function(classroom) {
            console.log("Success");
            joinClassroom(classroom.instructor,classroom.name).then(function(result) {
                res.send({ msg: "Success" });
            })
            .catch(function(err) {
                console.log(err);
            });
        })
        .catch(function(err) {
            console.log(err);
            res.send({ msg: "Error" });
        });
});

router.post("/classroom/join", function(req, res) {

    //very basic way to join classroom
    joinClassroom(req.session.userid,req.body.classroom).then(function(result) {
            res.redirect("/home");
            })
            .catch(function(err) {
                console.log(err);
            });

});

router.get("/classroom/:id", middleware.checkLogin, function(req, res) {

    classroomModel.findById(req.params.id).populate("instructor", "firstName lastName")
        .then(function(classroom) {
            res.send({ classroom: classroom });
        })
        .catch(function(err) {
            console.log(err);
        });

});

router.get("/classroom/:id/edit", function(req, res) {
    //render that page we discussed
});

router.post("/classroom/:id/edit", function(req, res) {
    //edit the classroom
});

router.get("/classroom/:classid/assignment/:assid", middleware.checkLogin, function(req, res) {

    var classroom = classroomModel.findById(req.params.classid).exec();
    var user = userModel.findById(req.session.userid).exec();

    Promise.all([classroom, user]).then(function(values) {
            classroom = values[0];
            user = values[1];

            // wanted to do this, but mongoose is being a bitch
            // classroom.execPopulate("assignment.id(req.params.assid).exercises")
            // .then(function(classroom){
            //     console.log(classroom.assignments.id(req.params.assid));
            // })

            // doing it manually
            var exercises = [];

            classroom.assignments.id(req.params.assid).exercises.forEach(function(exerciseid) {
                exercises.push(exerciseModel.findById(exerciseid).select("problem"));
            });

            Promise.all(exercises).then(function(values) {
                res.render("exercises.ejs", { user: user, exercises: values});
            });
        })
        .catch(function(err) {
            console.log(err);
        });
});

router.post("/classroom/:classid/assignment/:assignmentid/exercise/exid", function(req, res) {
    //huge ass route?
    //is this how we want to post answers to assignment exercises as opposed to just exercises?
    //we could also use ajax and send an object to /exercise/:id
});


function joinClassroom(userID, classroomID) {

    var classroom = classroomModel.findOne({ name: classroomID }).exec() //exec makes this a promise

    var user = userModel.findById(userID).exec()

    return Promise.all([classroom, user]).then(function(values) { //we can do this with promises. better than nesting .then().
            classroom = values[0];
            user = values[1];

            //User and classroom save each other
            user.classrooms.push(classroom.id);
            classroom.students.push(user.id);

            user.save();
            classroom.save();
            return true
        })
        .catch(function(err) {
            console.log(err);
            return false
        });

}

module.exports = router;
