/* global $ */

$(document).ready(function() {
    // clicking on an exercise in the list
    $('a.list-group-item').click(function(event) {
        // prevent default behavior
        event.preventDefault();

        // get the href containing exercise id
        let href = $(this).attr('href');

        // make a get request for the exercise data
        $.get(href)
        .done(function(response) {
            // clear exercise field
            $("#exercise-field").html("");
            
            // set the exercise-id property of exercise-field
            $("#exercise-field").attr('exercise-id', response[0]);
            
            var exerciseType = response[1];
            
            // handle different types of exercises based on exerciseType
            switch(exerciseType) {
                case "truthTable":
                    BuildTruthTable(response);
                    break;
                case "symbolization":
                    BuildSymbolization(response);
                    break;
            }
        });
        
        // enable buttons
        $('#check-solution').prop('disabled', false);
        $('#save-solution').prop('disabled', false);
        
        // clear alerts
        $("#feedback-area").text("");
    });

    // handle click on dynamically generated truth table buttons
    $(document).on('click', '.truth-table-button', function() {
        if ($(this).text() == "T") {
            $(this).text("F");
        }
        else {
            $(this).text("T");
        }
    });
    
    // handle click on symbolization buttons
    $(document).on('click', '.symbol-btn', function() {
        var equationField = $('#equation');
        
       equationField.val(equationField.val() + $(this).text());
    });

    // handle clicking on 'Check' button
    $('#check-solution').click(function() {
        // fetch the answer data based on type of exercise
        var exerciseType = $('#exercise-field').attr('exerciseType');
        var answerData
        
        switch(exerciseType) {
            case 'truthTable':
                answerData = FetchTruthTableData();
                break;
            case 'symbolization':
                answerData = FetchSymbolizationData();
                break;
        }
        
        var data = JSON.stringify({answer : answerData, save : false});

        // send answer via ajax POST request
        $.ajax({
           url: "/exercises/" + $("#exercise-field").attr("exercise-id"),
           type: "post",
           data: data,
           contentType: "application/json; charset=utf-8",
           dataType: 'json'
        }).done(function(response) {
            var feedback = "";
            
            // format response string nicely
            if (response.msg == "true") {
                feedback += "<div id='feedback-alert' class='alert alert-success'>";
                feedback += "Correct";
            } else if (response.msg == "false") {
                feedback += "<div id='feedback-alert' class='alert alert-danger'>";
                feedback += "Incorrect";
            } else {
                feedback += "<div id='feedback-alert' class='alert alert-warning'>";
                feedback += "Error";
            }
            
            feedback += "</div>";
            
            // place the alert in the DOM
            $("#feedback-area").text("");
            $("#feedback-area").append(feedback);
        });
    });
    
    // handle clicking on 'Save' button
    $('#save-solution').click(function() {
        // fetch the answer data based on type of exercise
        var exerciseType = $('#exercise-field').attr('exerciseType');
        var answerData
        
        switch(exerciseType) {
            case 'truthTable':
                answerData = FetchTruthTableData();
                break;
            case 'symbolization':
                answerData = FetchSymbolizationData();
                break;
        }
        
        var data = JSON.stringify({answer : answerData, save : true});

        // send answer via ajax POST request
        $.ajax({
           url: "/exercises/" + $("#exercise-field").attr("exercise-id"),
           type: "post",
           data: data,
           contentType: "application/json; charset=utf-8",
           dataType: 'json'
        }).done(function(response) {
            var feedback = "";
            
            // format response string nicely
            if (response == true) {
                feedback += "<div id='feedback-alert' class='alert alert-success'>";
                feedback += "Answer Saved!";
            } else {
                feedback += "<div id='feedback-alert' class='alert alert-warning'>";
                feedback += "Error";
            }
            
            feedback += "</div>";
            
            // place the alert in the DOM
            $("#feedback-area").text("");
            $("#feedback-area").append(feedback);
        });
    });
});

// build a truth table
function BuildTruthTable(response) {
    // organize response into readable variables
    var exerciseID = response[0];
    var exerciseType = response[1];
    var sentences = response[2];
    var valueCount = response[3];
    var userAnswer = response[4];
    
    // build and append the table for exercise to the DOM
    var table = "<table>";
    
    var answerSentences;
    var answerValues;
    
    // if the response contained saved answers, load them
    if (userAnswer.length > 0) {
        answerSentences = userAnswer[0];
        answerValues = userAnswer[1];
    } else {
        // fill values array with '?' if no saved answer was found
        answerSentences = sentences;
        answerValues = [];
        
        for (var i = 0; i < valueCount; i++) {
            var valueRow = [];
            
            for (var j = 0; j < sentences.length; j++) {
                valueRow.push("?");
            }
            
            answerValues.push(valueRow);
        }
    }
    
    // build headers
    table += "<tr id='sentences'>";
    
    
    for (var i = 0; i < answerSentences.length; i++) {
        table += "<th>" + answerSentences[i] + "</th>";
    }

    table += "</tr>";

    // build rows (values)
    for (var i = 0; i < answerValues.length; i++) {
        table += "<tr class='values'>";

        // build columns (sentences)
        for (var j = 0; j < answerSentences.length; j++) {
            table += "<td><button class='truth-table-button'>";
            
            // format the values into 'T', 'F' and '?'
            if (answerValues[i][j] == 1) {
                table += "T";
            } else if (answerValues[i][j] == 0) {
                table += "F";
            } else {
                table += "?";
            }
            
            table += "</button></td>";
        }

        table += "</tr>";
    }
    
    // set the exercise type to exercise area
    $("#exercise-field").attr('exerciseType', 'truthTable');

    // append everything
    $("#exercise-field").append(table);
}

// fetch and format the answer from the truth table
function FetchTruthTableData() {
    // temporary arrays to store data for POST request
    var sentences = [];
    var values = [];

    // for each sentence entry, add it to the sentences array
    $('#sentences th').each(function() {
        sentences.push($(this).text());
    });

    // for each value row, add a value array to the values
    $(".values").each(function() {
        var valueRow = [];

        // for each entry, add it to the row of values array
        $("td", this).each(function() {

            //reformat 'T' and 'F' strings as int values and push them
            if ($(this).text() == "F") {
                valueRow.push(0);
            }
            else if ($(this).text() == "T") {
                valueRow.push(1);
            }
            else {
                valueRow.push(-1);
            }
        });

        values.push(valueRow);
    });

    // return answer data
    return { sentences, values };
}

// build a Symbolization exercise
function BuildSymbolization(response) {
    // organize response into readable variables
    var exerciseID = response[0];
    var exerciseType = response[1];
    var problem = response[2];
    var atomics = response[3];
    var userAnswer = response[4];
    
    // build the symbolization exercise to append to DOM
    var exerciseElement = "";
    
    // add the exercise information and input field
    exerciseElement += "<div>";
        exerciseElement += "<h4>" + problem + "</h4>";
        exerciseElement += "<div id='symbolization-exercise' class='tabcontent'>";
            exerciseElement += "<h6>" + atomics + "</h6>";
            exerciseElement += "<label for='equation'>Enter a logical sentence corresponding to the English phrase above:</label>";
            exerciseElement += "<input type='equation' class='form-control' id='equation' placeholder='ex. P→R' name='equation'>";
            
            // add the symbol buttons
            exerciseElement += "<div id='symbol-buttons' class='form-group col'>";
                exerciseElement += "<button type='button' class='btn btn-secondary symbol-btn'>∧</button>";
                exerciseElement += "<button type='button' class='btn btn-secondary symbol-btn'>∨</button>";
                exerciseElement += "<button type='button' class='btn btn-secondary symbol-btn'>→</button>";
                exerciseElement += "<button type='button' class='btn btn-secondary symbol-btn'>¬</button>";
                exerciseElement += "<button type='button' class='btn btn-secondary symbol-btn'>↔</button>";
                exerciseElement += "<button type='button' class='btn btn-secondary symbol-btn'>|</button>";
                exerciseElement += "<button type='button' class='btn btn-secondary symbol-btn'>↓</button>";
            exerciseElement += "</div>";
        exerciseElement += "</div>";
    exerciseElement += "</div>";
    
    // set the exercise type to exercise area
    $("#exercise-field").attr('exerciseType', 'symbolization');
    
    // append everything to the DOM
    $("#exercise-field").append(exerciseElement);
    
    // load a saved answer if it exists
    if (typeof userAnswer == "string") {
        $('#equation').val(userAnswer);
    }
}

// fetch symbolization exercise asnwer
function FetchSymbolizationData() {
    return $('#equation').val();
}