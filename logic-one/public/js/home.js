/* global $ */

$(document).ready(function() {
    // populate assignments from default classroom if exists
    if ($('#item-selection-button').attr('classroom-id')) {
        LoadAssignments("/classroom/" + $('#item-selection-button').attr("classroom-id"));
    }

    // clicking on a classroom in the list
    $('button.classroom-dropdown-item').click(function(event) {
        // prevent default behavior
        event.preventDefault();

        LoadAssignments("/classroom/" + $(this).attr('classroom-id'));

        // swap the current and selected classroom element properties
        var newClassroomID = $(this).attr('classroom-id');
        var newClassroomName = $(this).html();

        $(this).attr('classroom-id', $('#item-selection-button').attr('classroom-id'));
        $(this).html($('#item-selection-button').html());

        $('#item-selection-button').attr('classroom-id', newClassroomID);
        $('#item-selection-button').html(newClassroomName);
    });
});

function LoadAssignments(classroomURL) {
    // make a get request for the classroom data
    $.get(classroomURL)
        .done(function(response) {
            
            var assignments = "";
            console.log(response);

            // for each assignment in the response, build a button
            response.classroom.assignments.forEach(function(assignment, index) {
                var assignmentLink = classroomURL + "/assignment/" + assignment._id;

                assignments += "<a class='list-group-item list-group-item-action' href="
                assignments += assignmentLink + ">";
                assignments += "Assignment " + (index + 1);
                assignments += "</a>";
            });

            // set the text of the assignment area to the buttons
            $("#assignment-list-area").html(assignments);
            $("#ClassName").text(response.classroom.name);
            $("#InstructorName").text(response.classroom.instructor.firstName + " " + response.classroom.instructor.lastName);
        });
}