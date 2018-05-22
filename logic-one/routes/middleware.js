const userModel = require("../models/userModel");

function checkLogin(req, res, next) {

    if (!req.session.userid) {
        req.session.previousPage = req.url;
        //does not work on ajax requests
        res.redirect("/login");
    }
    else {
        next();
    }
}

function checkNoLogin(req, res, next) {

    if (req.session.userid) {
        res.redirect("/home");
    }
    else {
        next();
    }
}

function saveAnswer(req, res, next) {

    userModel.findById(req.session.userid)
        .then(function(currentUser) {
            // the newly-submitted answer
            var newAnswer = {
                exerciseID: req.params.id,
                answer: req.body.answer
            };
            // if user already has savedAnswers
            if (currentUser.savedAnswers.length > 0) {
                // keep track of whether an existing record is found
                var duplicateFound = false;
                // for each saved answer, check if the answer already exists
                currentUser.savedAnswers.forEach(function(savedAnswer, index) {
                    // check if answer exists for this exercise
                    if (newAnswer.exerciseID == savedAnswer.exerciseID) {
                        // overwrite the old answer with the new one
                        currentUser.savedAnswers.splice(index, 1, newAnswer);
                        duplicateFound = true;
                    }
                });
                // if a duplicate record wasn't found, push the new answer in
                if (!duplicateFound) {
                    currentUser.savedAnswers.push(newAnswer);
                }
            }
            else {
                // user has no savedAnswers, so create them and add the answer
                currentUser.savedAnswers = [newAnswer];
            }
            // save the user data back to the database
            currentUser.save();
        })
        .catch(function(err) {
            console.log(err);
        });

    next();
}

module.exports = {
    checkLogin: checkLogin,
    checkNoLogin: checkNoLogin,
    saveAnswer: saveAnswer
};
