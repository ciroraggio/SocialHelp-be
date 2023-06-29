const express = require("express");
const auth = require("../middleware/auth");
const postController = require("../controllers/PostController");
const router = new express.Router();

//create post
router.post("/post/createPost", auth, postController.createPost);

//get one post by id
router.get("/post/getPostById/:id", auth, postController.getPostById);

//get all current user and following users posts
router.get("/post/getAllPostsByUser", auth, postController.getAllPostsByUser);

router.get("/post/getAllFeedPostsByUser", auth, postController.getAllFeedPostsByUser);

//get one post by id and delete it
router.delete("/post/deletePostById/:id", auth, postController.deletePostById);

//get one post by id and update it
router.put("/post/updatePostById/:id", auth, postController.updatePostById);

module.exports = router;
