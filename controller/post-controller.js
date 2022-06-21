const Post = require("../models/post");
const validationSession = require("../util/validation-session");

const sessionValidation = require("../util/validation-session");
const validation = require('../util/validation')

function getHome(req, res) {
  res.render("home", { csrfToken: req.csrfToken() });
}

async function getAdmin(req, res) {
  if (!res.locals.isAuth) {
    return res.status(401).render("401");
  }

  sessionErrorData = sessionValidation.getSessionErrorData(req);

  const posts = await Post.fetchAll();

  res.render("admin", {
    posts: posts,
    inputData: sessionErrorData,
    csrfToken: req.csrfToken(),
  });
}

async function getSinglePost(req, res) {
  const post = new Post(null, null, req.params.id);
  const postData = await post.fetch();

  if (!post.title || !post.content) {
    return res.status(404).render("404");
  }

  sessionErrorData = sessionValidation.getSessionErrorData(req);

  res.render("single-post", {
    post: postData,
    inputData: sessionErrorData,
    csrfToken: req.csrfToken(),
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
