var exerciseModel = require("../models/exerciseModel");

var exerciseList = [];

exerciseList.push(new exerciseModel({

    problem: "Q->P",
    answer: {
        sentences: ["Q", "P", "Q->P"],
        values: [
            [1, 1, 1],
            [1, 0, 0],
            [0, 1, 1],
            [0, 0, 1]
        ]
    }
    
}));

exerciseList.push(new exerciseModel({

    problem: "Q&P",
    answer: {
        sentences: ["Q", "P", "Q&P"],
        values: [
            [1, 1, 1],
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 0]
        ]
    }

}));

exerciseList.push(new exerciseModel({

    problem: "Q|P",
    answer: {
        sentences: ["Q", "P", "Q->P"],
        values: [
            [1, 1, 1],
            [1, 0, 1],
            [0, 1, 1],
            [0, 0, 0]
        ]

    }

}));

exerciseList.push(new exerciseModel({

    problem: "~Q",
    answer: {
        sentences: ["Q", "~Q"],
        values: [
            [1, 0],
            [0, 1]
        ]
    }

}));



function seed() {

    for (i = 0; i < exerciseList.length; i++) {
        exerciseList[i].save().catch(function(err) {
            console.log(err);
        });
    }

}

module.exports = seed;