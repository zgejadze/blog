const Post = require("../models/post");
const validationSession = require("../util/validation-session");

const sessionValidation = require("../util/validation-session");
const validation = require('../util/validation')

function getHome(req, res) {
  res.render("home");
}

async function getAdmin(req, res) {

  sessionErrorData = sessionValidation.getSessionErrorData(req);

  const posts = await Post.fetchAll();

  res.render("admin", {
    posts: posts,
    inputData: sessionErrorData,
  });
}

async function getSinglePost(req, res, next) {
  let post;
  try {
    post = new Post(null, null, req.params.id)
  } catch(error){
    next(error);
    return;
  }
  const postData = await post.fetch();
  sessionErrorData = sessionValidation.getSessionErrorData(req);

  res.render("single-post", {
    post: postData,
    inputData: sessionErrorData,
  });
}

async function createPost(req, res) {
  const enteredPostTitle = req.body["post-title"];
  const enteredpostContent = req.body["post-content"];

  if (!validation.postIsValid(enteredPostTitle,enteredpostContent)) {
    validationSession.flashErrorsToSession(
      req,
      {
        message: "Invalid input - please check your data.",
        title: enteredPostTitle,
        content: enteredpostContent,
      },
      function () {
        res.redirect("/admin");
      }
    );
    return;
  }
  const newPost = new Post(enteredPostTitle, enteredpostContent);

  await newPost.save();

  res.redirect("/admin");
}

async function editPost(req, res) {
  const enteredPostTitle = req.body.title;
  const enteredpostContent = req.body["post-content"];

  if (!validation.postIsValid(enteredPostTitle,enteredpostContent)
  ) {validationSession.flashErrorsToSession(
    req,
    {
      message: "Invalid input - please check your data.",
      title: enteredPostTitle,
      content: enteredpostContent,
    },
    function () {
      res.redirect("/post/" + req.params.id + "/edit");
    })
    return;
  }

  const updatedPost = new Post(
    enteredPostTitle,
    enteredpostContent,
    req.params.id
  ); // new post update must go here
  await updatedPost.save();
  res.redirect("/admin");
}

async function deletePost(req, res) {
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
  deletePost: deletePost,
};
