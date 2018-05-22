const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require('express-session');
const routes = require("./routes/indexRoutes");

//============== mongoose setup

mongoose.connect(process.env.MONGODB_URL);
// TODO: use promises
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("[DATABASE] Connected to " + process.env.MONGODB_URL);
});

//============== express setup

var app = express();
app.use(express.static(__dirname + "/public")); // Allows us to use scripts and css files in public

//============== express-session setup

// TODO: add memory store
app.use(session({
    secret: 'What is love?',
    resave: false,
    saveUninitialized: true
}));


//============== body-parser setup

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(routes);

//============== seed when needed

// require("./util/seed.js").seed();

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("[SERVER] Listening on " + process.env.IP + ":" + process.env.PORT + "...");
});
