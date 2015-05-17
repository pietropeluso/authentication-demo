var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = mongoose.model("User", new Schema({
  id: ObjectId,
  firstName: String,
  lastName: String,
  email: {type: String, unique: true},
  password: String
}));

var app = express();

// all environments
app.set("view engine", "jade");
app.set("port", process.env.PORT || 1337);
app.locals.pretty = true; // disable html minifying by Jade

// database connection
mongoose.connect('mongodb://localhost/auth');

// Middleware
app.use(bodyParser.urlencoded({ extended : true }));

// Routes
app.get("/", function(req, res){
  res.render("index.jade");
});

app.get("/register", function(req, res){
  res.render("register.jade");
});

app.post("/register", function(req, res) {
  // create an instance of the model
  var user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  });

  user.save(function(err) {
    if (err) {
      var msg = "Can't save the user to the database";
      if (err.code === 11000) {
        msg = "The email address provided is already used, please choose another one";
      }
      res.render("register.jade", {error: error});
    } else {
      res.redirect("/dashboard");
    }

  });
});

app.get("/login", function(req, res){
  res.render("login.jade");
});

app.post("/login", function(req, res) {
  User.findOne({ email: req.body.email }, function(err, user){
    if (!user) {
      res.render("login.jade", { error: "Invalid email provided" });
    } else {
      if (user.password === req.body.password) {
        res.redirect("/dashboard");
      } else {
        res.render("login.jade", { error: "Invalid password provided" });
      }
    }
  });
});

app.get("/dashboard", function(req, res){
  res.render("dashboard.jade");
});

app.get("/logout", function(req, res){
  res.redirect("/");
});

app.listen(app.get('port'), function(){
  console.log("Web server listening on: 127.0.0.1:" + app.get('port'));
})