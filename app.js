var express = require("express");

var app = express();

// all environments
app.set("view engine", "jade");
app.set("port", process.env.PORT || 1337);

app.locals.pretty = true; // disable html minifying by Jade

// Routes
app.get("/", function(req, res){
  res.render("index.jade");
});

app.get("/register", function(req, res){
  res.render("register.jade");
});

app.get("/login", function(req, res){
  res.render("login.jade");
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