const express = require("express");
const bcrypt = require("bcryptjs");
const mongoDb = require("mongodb");

const db = require("../data/database");
const ObjectId = mongoDb.ObjectId;

const router = express.Router();

router.get("/", function (req, res) {
  res.render("home", { csrfToken: req.csrfToken() });
});

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
    inputData: sessionInputData,
    csrfToken: req.csrfToken(),
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
    csrfToken: req.csrfToken(),
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

router.get("/admin", async function (req, res) {
  if (!res.locals.isAuth) {
    return res.status(401).render("401");
  }

  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      title: "",
      content: "",
    };
  }

  req.session.inputData = null;

  const posts = await db.getDb().collection("posts").find().toArray();

  res.render("admin", {
    posts: posts,
    inputData: sessionInputData,
    csrfToken: req.csrfToken(),
  });
});

router.post("/admin", async function (req, res) {
  const enteredPostTitle = req.body["post-title"];
  const enteredpostContent = req.body["post-content"];
  const enteredPostObject = {
    title: enteredPostTitle,
    content: enteredpostContent,
  };

  if (
    !enteredPostTitle ||
    !enteredpostContent ||
    enteredPostTitle.trim() === "" ||
    enteredpostContent.trim() === ""
  ) {
    req.session.inputData = {
      hasError: true,
      message: "Invalid input - please check your data.",
      title: enteredPostTitle,
      content: enteredpostContent,
    };
    req.session.save(function () {
      res.redirect("/admin");
    });
    return;
  }

  await db.getDb().collection("posts").insertOne(enteredPostObject);
  res.redirect("/admin");
});

router.get("/post/:id/edit", async function (req, res) {
  const postId = new ObjectId(req.params.id);

  const postData = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: postId });
  res.render("single-post", { post: postData , csrfToken: req.csrfToken()});
});

router.post("/post/:id/edit", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const newTitle = req.body.title;
  const newContent = req.body["post-content"];

  await db
    .getDb()
    .collection("posts")
    .updateOne(
      { _id: postId },
      { $set: { title: newTitle, content: newContent } }
    );

  res.redirect("/admin");
});

router.post("/delete/:id", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  await db.getDb().collection("posts").deleteOne({ _id: postId });

  res.redirect("/admin");
});

router.post("/logout", function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.redirect("/");
});

module.exports = router;
