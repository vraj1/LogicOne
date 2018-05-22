var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');


// TODO: Refactor Validation
var userSchema = new mongoose.Schema({
    firstName: {type: String, required: [true, "First Name Required"]},
    lastName: {type: String, required: [true, "Last Name Required"]},
    email: {type: String, unique: true, required: [true, "Email Required"]},
    password: {type: String, required: [true, "Password Required"], bcrypt: true},
    classrooms: [{type: mongoose.Schema.ObjectId, ref:"Classroom"}],
    savedAnswers: []
});



userSchema.plugin(uniqueValidator);
userSchema.plugin(require('mongoose-bcrypt'));
var userModel = mongoose.model("User", userSchema);

module.exports = userModel;
