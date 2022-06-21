const path = require("path");
const express = require("express");
const db = require("./data/database");
const session = require("express-session");

const blogRoutes = require("./routes/demo");
const authRoutes = require("./routes/auth");
const authMiddleware = require('./middlewares/auth-middlewares')

const database = require("./data/database");

const sessionConfig = require("./config/session"); // imports session configurations

const csrf = require("csurf");
const addCsrfTokenMiddleware = require('./middlewares/csrf-token-middleware')

const { createSessionConfig } = require("./config/session");

const mongoDbSessionStore = sessionConfig.createSessionStore(session); 

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

const port = 3000;

app.use(session(sessionConfig.createSessionConfig(mongoDbSessionStore)));

app.use(csrf());
app.use(addCsrfTokenMiddleware)

app.use(authMiddleware);

app.use(authRoutes);
app.use(blogRoutes);

app.use(function (error, req, res, next) {
  res.render("500", {csrfToken: req.csrfToken()} );
});

db.connectToDatabase().then(function () {
  app.listen(3000);
});
