const express = require("express");
const bcrypt = require("bcryptjs");
const mongoDb = require("mongodb");

const db = require("../data/database");
const ObjectId = mongoDb.ObjectId;


const router = express.Router();

router.get("/", function (req, res) {
  res.render("home");
});

router.get("/signup", function (req, res) {
  res.render("signup");
});

router.post("/signup", async function (req, res) {
  const userData = req.body;
  const enteredPassword = userData.password;
  const enteredEmail = userData.email;
  const enteredConfirmEmail = userData["confirm-email"];

  const hashedPassword = await bcrypt.hash(enteredPassword, 12);

  const user = {
    email: enteredEmail,
    password: hashedPassword,
  };

  await db.getDb().collection("users").insertOne(user);
  res.redirect("/admin");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/login", async function (req, res) {
  const userData = req.body;
  const enteredPassword = userData.password;
  const enteredEmail = userData.email;

  const existingUser = await db.getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (!existingUser) {
    return res.redirect("/login");
  }

  const passwordAreEqual = await bcrypt.compare(
    enteredPassword,
    existingUser.password
  );

  if (!passwordAreEqual) {
    return res.redirect("/login");
  }

  res.redirect("/admin");
});

router.get("/admin", async function (req, res) {
  const posts = await db.getDb().collection("posts").find().toArray();

  res.render("admin", { posts: posts });
});

router.post("/admin", async function (req, res) {
  const enteredPostTitle = req.body["post-title"];
  const enteredpostContent = req.body["post-content"];
  const enteredPostObject = {
    title: enteredPostTitle,
    content: enteredpostContent,
  };
  await db.getDb().collection("posts").insertOne(enteredPostObject);
  res.redirect("/admin");
});

router.get("/post/:id/edit", async function (req, res) {
  const postId = new ObjectId(req.params.id);

  const postData = await getDb().collection("posts").findOne({ _id: postId });
  res.render("single-post", { post: postData });
});

router.post("/post/:id/edit", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const newTitle = req.body.title;
  const newContent = req.body["post-content"];

  await db.getDb()
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

module.exports = router;
