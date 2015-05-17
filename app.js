var express = require("express");

var app = express();

app.set("view engine", "jade");
app.set("port", process.env.PORT || 1337);

app.get("/", function(req, res){
  res.render("index.jade");
});

app.get("/register", function(req, res){
  res.render("register.jade");
});

app.listen(app.get('port'), function(){
  console.log("Web server listening on: 127.0.0.1:" + app.get('port'));
})