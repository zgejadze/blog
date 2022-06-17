const express = require("express");

const blogControllers = require('../controller/post-controller')

const router = express.Router();

router.get("/", blogControllers.getHome);

router.get("/admin", blogControllers.getAdmin);

router.post("/admin", blogControllers.createPost);

router.get("/post/:id/edit", blogControllers.getSinglePost);

router.post("/post/:id/edit", blogControllers.editPost);

router.post("/delete/:id", blogControllers.deletePost);

module.exports = router;
