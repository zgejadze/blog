async function auth (req, res, next) {
    const user = req.session.user;
    const isAuth = req.session.isAuthenticated;
    if (!isAuth || !user) {
      return next();
    }
  
    res.locals.isAuth = isAuth;
  
    next();
  }

  module.exports = auth