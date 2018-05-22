const router = require("express").Router();
const middleware = require("./middleware");
const userModel = require("../models/userModel");
const classroomModel = require("../models/classroomModel");
const exerciseRoutes = require("./exerciseRoutes");
const classroomRoutes = require("./classroomRoutes");


router.get("/", middleware.checkNoLogin, function(req, res) {
    res.render("landing.ejs");
});

router.get("/signup", middleware.checkNoLogin, function(req, res) {
    res.render("signup.ejs");
});

router.post("/signup", middleware.checkNoLogin, function(req, res) {

    var user = new userModel(req.body);

    // attempt to save the new user
    user.save()
        .then(function(user) {
            req.session.userid = user.id;
            res.redirect("/exercises");
        })
        .catch(function(err) {
            console.log(err);

            // go through all missing fields and render them
            var missingFields = [];

            Object.keys(err.errors).forEach(function(field) {

                // if the error is email, make it look nice
                if (field == "email") {
                    missingFields.push("Email Address is taken");
                }
                else {
                    missingFields.push(err.errors[field].message);
                }

            });

            res.render("signup.ejs", { missingFields: missingFields });
        });

});

router.get("/login", middleware.checkNoLogin, function(req, res) {
    res.render("login.ejs");
});

router.post("/login", middleware.checkNoLogin, function(req, res) {

    userModel.findOne({ email: req.body.email }).exec()
    .then(function(user){
            //verifies password on login against hashed password stored in database
        if (user && user.verifyPasswordSync(req.body.password)) {
            req.session.userid = user.id;
            req.session.previousPage ? res.redirect(req.session.previousPage) : res.redirect("/home");
        }
        else{
            throw "Email or Password Invalid";
        }
    })
    .catch(function(err){
        console.log(err);
        res.render("login.ejs", { msg: "Email or Password Invalid" });
    });
});

router.get("/logout", function(req, res) {
    req.session.destroy();

    res.redirect("/");
});

router.get("/home", middleware.checkLogin, function(req, res) {


    userModel.findById(req.session.userid).populate("classrooms", "name")
        .then(function(user) {
            res.render("home.ejs", { user: user });
        }).catch(function(err) {
            console.log(err);
        });
});

router.use(exerciseRoutes);
router.use(classroomRoutes);

module.exports = router;
