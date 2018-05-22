var className = $("#name_in");
var assignmentPane = $("#assignment_pane");
var selectorHeading = $("#selector_heading");
var selector1 = $("#selector1");
var selector2 = $("#selector2");

var assignments = [
    []
];
var assignmentsLean = [
    []
];
var exercises = [];
var ass_no = 0;

updateAssignmentPane();
updateExercises();



function updateExercises() {
    $.get("/exercises/query=problem")
        .done(function(data) {
            exercises = data;
            updateSelector2();
        })
        .fail(function(err) {
            console.log(err);
        });
}

function updateSelector2() {
    selector2.empty();
    $("<h3></h3>", { text: "All Exercises" }).appendTo(selector2);
    exercises.forEach(function(exercise) {
        $("<option></option>", { id: exercise._id, value: exercise, text: exercise.problem, click: addToAssignment }).appendTo(selector2);
    });
}

function addToAssignment() {

    if (ass_no < 0) return;
    var exercise = { id: this.id, problem: $(this).text() };
    if (!assignmentsLean[ass_no].includes(exercise.id)) {
        assignmentsLean[ass_no].push(exercise.id);
        assignments[ass_no].push(exercise);
    }
    updateSelector1();
}



function createAssignment() {
    assignments.push([]);
    assignmentsLean.push([]);
    updateAssignmentPane();
}

function updateAssignmentPane() {
    assignmentPane.empty();
    for (var i = 0; i < assignments.length; i++) {
        $("<button></button>", { id: "assignment" + (i + 1), value: i, text: "Assignment " + (i + 1), "class": "btn btn-secondary", type: "button", click: selectAssignment }).appendTo(assignmentPane);
    }
    $("#assignment" + i).focus().trigger("click");
    $("<button></button>", { id: "add_ass_btn", text: "Add Assignment", click: createAssignment, "class": "btn btn-secondary", type: "button" }).appendTo(assignmentPane);
}

function selectAssignment() {
    ass_no = $(this).val();
    selectorHeading.text($(this).text());
    updateSelector1();
}

function updateSelector1() {
    selector1.empty();
    if (ass_no < 0) return;
    for (var i = 0; i < assignments[ass_no].length; i++) {
        var exercise = assignments[ass_no][i];
        $("<option></option>", { id: exercise.id, text: exercise.problem, value: i, click: removeFromAssignment }).appendTo(selector1);
    }
}

function removeFromAssignment() {
    assignments[ass_no].splice($(this).val(), 1);
    assignmentsLean[ass_no].splice($(this).val(), 1);
    updateSelector1();
}

function removeAssignment() {

}

function createClass() {
    name = className.val();
    
    $.ajax({
        type: "POST",
        url: "/classroom/create",
        data:  JSON.stringify({ name: name, assignments: assignmentsLean }),
        contentType: "application/json; charset=utf-8",
        dataType: 'json'
    })
    .done(function(res){
        if (res.msg === "Success") {window.location.href = "/home";}
        else{alert(res.msg)}
        
    });
}
