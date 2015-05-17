function createUserSession(req, res, user) { 
  req.user = user;
  delete req.user.password; //make the password unavailable, even if it's encrypted
  req.session.user = req.user;
  res.locals.user = req.user;
}

module.exports.createUserSession = createUserSession;
