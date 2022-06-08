const path = require("path");
const express = require("express");
const db = require("./data/database");
const session = require("express-session");

const blogRoutes = require("./routes/demo");
const authRoutes = require("./routes/auth")

const database = require("./data/database");
const mongoDbStore = require("connect-mongodb-session");

const MongoDbStore = mongoDbStore(session);

const csrf = require('csurf');


const app = express();

const sessionStore = new MongoDbStore({
  uri: "mongodb://127.0.0.1:27017",
  databaseName: 'new-blog',
  collection: "sessions"
});


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

const port = 3000;

app.use(
  session({
    secret: "secret-blog",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 2 * 24 * 60 * 60 * 1000 },
  })
);

app.use(csrf());

app.use(function(req, res, next){
    const user = req.session.user
    const isAuth = req.session.isAuthenticated
    if(!isAuth || !user){
      return  next()
    }
    
    res.locals.isAuth = isAuth;

    next();
})

app.use(blogRoutes);
app.use(authRoutes);

app.use(function(error, req , res, next){
    res.render('500');
})

db.connectToDatabase().then(function () {
  app.listen(3000);
});
