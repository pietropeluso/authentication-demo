var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var bcryptjs = require("bcryptjs");
var sessions = require("client-sessions");
var csrf = require("csurf");

var User = require('./api/user/user.model');

var app = express();

// all environments
app.set("view engine", "jade");
app.locals.pretty = true; // disable html minifying by Jade
app.set("port", process.env.PORT || 1337);

// database connection
mongoose.connect('mongodb://localhost/auth');

// Middleware
app.use(bodyParser.urlencoded({ extended : true }));
app.use(sessions({
  cookieName: "session",
  secret: "dfjsahigewiruhw39jfg9sif4215qweffq398f93f9qhf",
  duration: 30 * 60 * 1000, //30 minutes
  activeDuration: 5 * 60 * 1000,
  ephemeral: true,  // delete the cookie when the browser is closed
  httpOnly: true  // cookies are not accessible by browser javascript
}));

app.use(csrf());

app.use(function(req, res, next) {  //custom middleware, this will be executed at first
  if (req.session && req.session.user) {
    User.findOne({ email: req.session.user.email}, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password; //make the password unavailable, even if it's encrypted
        req.session.user = req.user;
        res.locals.user = req.user;
      }
      next();
    });
  } else {
    // no session information
    next();
  }
});

function requireLogin(req, res, next) {
  if (!req.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

// Routes
app.get("/", function(req, res){
  res.render("index.jade");
});

app.get("/register", function(req, res){
  res.render("register.jade", { csrfToken: req.csrfToken() });
});

app.post("/register", function(req, res) {
  // create a hash from the user password
  var hash = bcryptjs.hashSync(req.body.password, bcryptjs.genSaltSync(10));

  // create an instance of the model
  var user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hash
  });

  user.save(function(err) {
    if (err) {
      var msg = "Can't save the user to the database";
      if (err.code === 11000) {
        msg = "The email address provided is already used, please choose another one";
      }
      res.render("register.jade", {error: msg});
    } else {
      req.user = user;
      delete req.user.password; //make the password unavailable, even if it's encrypted
      req.session.user = req.user;
      res.locals.user = req.user;

      res.redirect("/dashboard");
    }

  });
});

app.get("/login", function(req, res){
  res.render("login.jade", { csrfToken: req.csrfToken() });
});

app.post("/login", function(req, res) {
  User.findOne({ email: req.body.email }, function(err, user){
    if (!user) {
      res.render("login.jade", { error: "Invalid email provided" });
    } else {
      if (bcryptjs.compareSync(req.body.password, user.password)) {
        req.session.user = user;  // setting a session cookie for the logged in user
        res.redirect("/dashboard");
      } else {
        res.render("login.jade", { error: "Invalid password provided" });
      }
    }
  });
});

app.get("/dashboard", requireLogin, function(req, res){
  res.render("dashboard.jade");
});

app.get("/logout", function(req, res){
  if (req.session) {
    req.session.reset();
  }
  res.redirect("/");
});

app.listen(app.get('port'), function(){
  console.log("Web server listening on port " + app.get('port'));
})