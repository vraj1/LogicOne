const exerciseModel = require("../models/exerciseModel");

function checkAnswer(exId, userAnswer) {

    var answerIsCorrect = exerciseModel.findById(exId).exec()
    .then(function(exercise) {
        var correctAnswer = exercise.answer;
        
        // compare the rows and columns of submitted answer to the actual answer
        for (var i = 0; i < correctAnswer.values.length; i++) {
            for (var j = 0; j < correctAnswer.values[i].length; j++) {
                if (correctAnswer.values[i][j] != userAnswer.values[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }).catch(function(err) {
        console.log(err);
    });
    
    return answerIsCorrect;
}



module.exports = {
    checkAnswer: checkAnswer
};
