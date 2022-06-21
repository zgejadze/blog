const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../data/database");

const router = express.Router();

router.get("/signup", function (req, res) {
  let sessionInputData = req.session.inputData;
  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: "",
      confirmEmail: "",
      password: "",
    };
  }

  req.session.inputData = null;

  res.render("signup", {
    inputData: sessionInputData
  });
});

router.post("/signup", async function (req, res) {
  const userData = req.body;
  const enteredPassword = userData.password;
  const enteredEmail = userData.email;
  const enteredConfirmEmail = userData["confirm-email"];
  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (
    enteredEmail !== enteredConfirmEmail ||
    !enteredEmail ||
    !enteredConfirmEmail ||
    !enteredPassword ||
    existingUser ||
    enteredPassword.trim().length < 6
  ) {
    req.session.inputData = {
      hasError: true,
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword,
      message: "",
    };

    if (enteredPassword.trim().length < 6) {
      req.session.inputData.message = "minimum password length is 6 characters";
    }
    if (existingUser) {
      req.session.inputData.message = "User already exists";
    }

    if (enteredEmail !== enteredConfirmEmail) {
      req.session.inputData.message = "Emails do not match";
    }

    req.session.save(function () {
      res.redirect("/signup");
    });

    return;
  }

  const hashedPassword = await bcrypt.hash(enteredPassword, 12);

  const user = {
    email: enteredEmail,
    password: hashedPassword,
  };

  await db.getDb().collection("users").insertOne(user);
  res.redirect("/login");
});

router.get("/login", function (req, res) {
  let sessionInputData = req.session.inputData;
  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: "",
      confirmEmail: "",
      password: "",
    };
  }

  req.session.inputData = null;

  res.render("login", {
    inputData: sessionInputData,
  });
});

router.post("/login", async function (req, res) {
  const userData = req.body;
  const enteredPassword = userData.password;
  const enteredEmail = userData.email;

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (!existingUser) {
    req.session.inputData = {
      hasError: true,
      email: enteredEmail,
      password: enteredPassword,
      message: "Cant log! wrong password or email",
    };

    req.session.save(function () {
      res.redirect("/login");
    });

    return;
  }

  const passwordAreEqual = await bcrypt.compare(
    enteredPassword,
    existingUser.password
  );
  if (!enteredEmail || !enteredPassword || !passwordAreEqual) {
    req.session.inputData = {
      hasError: true,
      email: enteredEmail,
      password: enteredPassword,
      message: "Cant log! wrong password or email",
    };

    req.session.save(function () {
      res.redirect("/login");
    });

    return;
  }
  req.session.user = {
    userId: enteredEmail,
    userPassword: enteredPassword,
  };
  req.session.isAuthenticated = true;

  req.session.save(function () {
    res.redirect("/admin");
  });
});

router.post("/logout", function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.redirect("/");
});

router.get('/401', function(req, res){
  res.status(401).render('401')
})

module.exports = router;
