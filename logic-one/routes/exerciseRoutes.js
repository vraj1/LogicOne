const router = require("express").Router();
const middleware = require("./middleware.js");
const userModel = require("../models/userModel");
const exerciseModel = require("../models/exerciseModel");
const problemSolver = require("../util/problemSolver");
const parse = require("../util/parse");


router.get("/exercises", middleware.checkLogin, function(req, res) {

    userModel.findById(req.session.userid)
        .then(function(user) {
            exerciseModel.find()
                .then(function(exercises) {
                    res.render("exercises.ejs", { user: user, exercises: exercises});
                });
        })
        .catch(function(err) {
            console.log(err);
        });
});

router.get("/exercises/create", middleware.checkLogin, function(req, res) {
    res.render("parse.ejs");
});

router.post("/exercises/create", middleware.checkLogin, function(req, res) {

    if (!req.body.name.trim()) {
        req.body.name = req.body.equation;
    }

    exerciseModel.createExercise(req.body.type,req.body.name,req.body.equation,req.body.atomics);

    res.render("parse.ejs", { msg: "Exercises is added to the database." });

});

router.get("/exercises/query=:query", function(req, res){
    exerciseModel.find({}, req.params.query)
    .then(function(exercises){
        res.send(exercises);
    });
});

router.get("/exercises/:id", middleware.checkLogin, function(req, res) {
    // find the exercise by ID, then send relevant values in the response
    exerciseModel.findById(req.params.id)
    .then(function(exercise) {
        
        var exerciseID = exercise.id;
        var exerciseType = exercise.exerciseType;
        
        // handle different exercise types differently
        switch(exerciseType) {
            case "truthTable":
                
                // create and send only truth table-relevant data
                var sentences = exercise.answer.sentences;
                var valueCount = exercise.answer.values.length;
                var userAnswer = [];
        
                // find if this user has a saved answer for this exercise
                userModel.findById(req.session.userid)
                .select('savedAnswers')
                .then(function(answers) {
                    // for each saved exercise, find the one with the matching id
                    answers.savedAnswers.forEach(function(ans) {
                        if (ans.exerciseID == exerciseID) {
                            userAnswer.push(ans.answer.sentences);
                            userAnswer.push(ans.answer.values);
                        }
                    });
                    
                    // send only the sentences and value count (not the full answer)
                    res.send([exerciseID, exerciseType, sentences, valueCount, userAnswer]);
                });
                
                break;
            case "symbolization":
                
                // create and send only symbolization-relevant data
                var problem = exercise.problem;
                var atomics = exercise.atomics;
                var userAnswer = {};
        
                // find if this user has a saved answer for this exercise
                userModel.findById(req.session.userid)
                .select('savedAnswers')
                .then(function(answers) {
                    // for each saved exercise, find the one with the matching id
                    answers.savedAnswers.forEach(function(ans) {
                        if (ans.exerciseID == exerciseID) {
                            userAnswer = ans.answer;
                        }
                    });
                    
                    // send only the problem, atomics, and userAnswer
                    res.send([exerciseID, exerciseType, problem, atomics, userAnswer]);
                });
                
                break;
        }


    })
    .catch(function(err){
        console.log(err);
    });
});

router.post("/exercises/:id", middleware.checkLogin, function(req, res) {
    if (req.body.save == false) {
        // check the answer and provide feedback, but don't save
        exerciseModel.checkAnswer(req.params.id, req.body.answer)
        .then(function(msg) {
            res.send({ msg: msg.toString() });
        })
        .catch(function(err) {
            console.log(err);
        });
    } else {
        // save the answer if the answer button was clicked
        middleware.saveAnswer(req, res, function(){});
        
        res.send(true);
    }
});

module.exports = router;
