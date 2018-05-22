const mongoose = require("mongoose");

var assignmentSchema = new mongoose.Schema({
    exercises: [{type: mongoose.Schema.Types.ObjectId, ref: "Exercise"}],
    dueDate: {type: Date}
});

var classroomSchema = new mongoose.Schema({
    instructor: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: [true, "Instructor is required"]},
    name: {type: String, required: [true, "Class must have a name"]},
    password: {type: String}, // ignore for now
    assignments: [assignmentSchema],
    students: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    gradebook: [] // ignore for now
});

var classroomModel = mongoose.model("Classroom", classroomSchema);

module.exports = classroomModel;