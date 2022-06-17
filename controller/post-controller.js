const mongoDb = require("mongodb");
const Post = require("../models/post");

function getHome(req, res) {
  res.render("home", { csrfToken: req.csrfToken() });
}

async function getAdmin(req, res) {
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

  const posts = await Post.fetchAll();

  res.render("admin", {
    posts: posts,
    inputData: sessionInputData,
    csrfToken: req.csrfToken(),
  });
}

async function getSinglePost(req, res) {
  const post = new Post(null, null, req.params.id);
  const postData = await post.fetch();
  res.render("single-post", { post: postData, csrfToken: req.csrfToken() });
}

async function createPost (req, res) {
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
}

async function editPost (req, res) {
  const postId = new ObjectId(req.params.id);
  const newTitle = req.body.title;
  const newContent = req.body["post-content"];

  const updatedPost = new Post(newTitle, newContent, postId); // new post update must go here
  await updatedPost.save();
  res.redirect("/admin");
}

async function deletePost (req, res) {
  const post = new Post(null, null, req.params.id);
  await post.delete();
  res.redirect("/admin");
}

module.exports = {
  getHome: getHome,
  getAdmin: getAdmin,
  getSinglePost: getSinglePost,
  createPost: createPost,
  editPost: editPost,
  deletePost: deletePost
};
