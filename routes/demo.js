const express = require("express");
const mongoDb = require("mongodb");

const db = require("../data/database");

const Post = require("../models/post");
const ObjectId = mongoDb.ObjectId;

const router = express.Router();

router.get("/", function (req, res) {
  res.render("home", { csrfToken: req.csrfToken() });
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
  const newPost = new Post(enteredPostTitle, enteredpostContent);

  await newPost.save();

  res.redirect("/admin");
});

router.get("/post/:id/edit", async function (req, res) {
  const postId = new ObjectId(req.params.id);

  const postData = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: postId });
  res.render("single-post", { post: postData, csrfToken: req.csrfToken() });
});

router.post("/post/:id/edit", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const newTitle = req.body.title;
  const newContent = req.body["post-content"];

  const updatedPost = new Post(newTitle, newContent, postId); // new post update must go here
  await updatedPost.save();
  res.redirect("/admin");
});

router.post("/delete/:id", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const post = new Post(null, null, postId);
  await post.delete();
  res.redirect("/admin");
});

module.exports = router;
