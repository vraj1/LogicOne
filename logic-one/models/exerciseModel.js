const parse = require("../util/parse");
var mongoose = require("mongoose");
// TODO: Refactor Validation

var options = { discriminatorKey: "exerciseType" };

var exerciseSchema = new mongoose.Schema({
    problem: { type: String, required: [true, "Problem is required"] }
}, options);

exerciseSchema.methods.validateAnswer = function() {
    throw "validateAnswer not implemented";
};

exerciseSchema.statics.checkAnswer = function(exerciseId, userAnswer){
    return this.findById(exerciseId).exec()
    .then(function(exercise) {
        return exercise.validateAnswer(userAnswer);
    }).catch(function(err) {
        console.log(err);
        return false;
    });
};

exerciseSchema.statics.exerciseTypes = {
    truthTable: function(name, equation,atomics){
         exerciseModel.create({
            exerciseType: "truthTable",
            problem: name,
            answer: parse.createAnswersForTruthTable(equation)
        })
        .then(function(model) {
            console.log(model);
        });
    },
    symbolization: function(name, equation, atomics){
         exerciseModel.create({
            exerciseType: "symbolization",
            problem: name,
            atomics: atomics,
            answer: parse.createAnswersForSymbolization(equation)
        })
        .then(function(model) {
            console.log(model);
        });

    }
};

exerciseSchema.statics.createExercise = function(exerciseType, name, equation, atomics){
    return this.exerciseTypes[exerciseType](name, equation,atomics);
}


var truthTableSchema = new mongoose.Schema({
    answer: {
        sentences: { type: Array, required: [true, "Sentences are required"] },
        values: {
            type: [
                []
            ],
            required: [true, "Values are required"]
        }
    }
});

truthTableSchema.methods.validateAnswer = function(userAnswer) {
    
    var correctAnswer = this.answer;

    // compare the rows and columns of submitted answer to the actual answer
    for (var i = 0; i < correctAnswer.values.length; i++) {
        for (var j = 0; j < correctAnswer.values[i].length; j++) {
            if (typeof(userAnswer.values[i][j]) == undefined || correctAnswer.values[i][j] != userAnswer.values[i][j]) {
                return false;
            }
        }
    }
    return true;

};

var symbolizationSchema = new mongoose.Schema({
    atomics: {
            type: String,
            required: [true, "Atomics are required"]
    },
    answer: {
            type: {},
            required: [true, "Values are required"]
    }
});

symbolizationSchema.methods.validateAnswer = function(input) {
    for (var i = 0; i < this.answer[Object.keys(this.answer)[0]].length; i++) {
        var booleanDictionary = {};
        for (var j = 0; j < Object.keys(this.answer).length-1; j++) {
            var key = Object.keys(this.answer)[j];
            var value = this.answer[key][i];
            booleanDictionary[key] = value
        }
        parse.parse(input, booleanDictionary);
        var solution = this.answer["solution"][i];
        var key = Object.keys(booleanDictionary).pop();
        var value = booleanDictionary[key];
        if (solution != value) {
            return false;
        }
    }
    return true;
};

var exerciseModel = mongoose.model("Exercise", exerciseSchema);

exerciseModel.discriminator("truthTable", truthTableSchema);
exerciseModel.discriminator("symbolization", symbolizationSchema);

module.exports = exerciseModel;
