const express = require("express");
const { GenericError, GenericSuccess } = require("../../utils/LoggerUtils");
const auth = require("../middleware/auth");
const Post = require("../models/post");
const router = new express.Router();

//create post
router.post("/post/createPost", auth, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      user: req.user._id,
    });
    await post.save();
    res.status(201).send(task);
    GenericSuccess("POST /createPost");
  } catch (error) {
    res.status(400).send(error);
    GenericError(`POST /createPost  ${error}`);
  }
});

//get one post by id
router.get("/post/getPostById/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id, user: req.user._id });
    if (!post) {
      return res.status(404).send();
    }
    res.send(post);
    GenericSuccess(`GET /getPostById  ${post}`);
  } catch (error) {
    res.status(500).send(error);
    GenericError(`GET /getPostById   ${error}`);
  }
});

//get all posts
router.get("/post/getAllPostsByUser", auth, async (req, res) => {
  try {
    const match = {};
    const sort = {};
    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] == "desc" ? -1 : 1;
    }
    await req.user.populate({
      path: "posts",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      },
    });
    res.send(req.user.posts);
    GenericSuccess(`GET /getAllPostsByUser`);
  } catch (error) {
    res.status(500).send(error);
    GenericError(`GET /getAllPostsByUser   ${error}`);
  }
});

//get one post by id and delete it
router.delete("/post/deletePostById/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const post = await Post.findOneAndDelete({ _id, user: req.user._id });
    if (!post) {
      return res.status(404).send();
    }
    res.send(post);
    GenericSuccess(`DELETE /deletePostById  ${post}`);
  } catch (error) {
    res.status(500).send(error);
    GenericError(`DELETE /deletePostById   ${error}`);
  }
});

//get one post by id and update it
router.put("/post/updatePostById/:id", auth, async (req, res) => {
  const toUpdate = Object.keys(req.body);
  const canUpdate = ["text"];
  const isValid = toUpdate.every((fieldToUpdate) =>
    canUpdate.includes(fieldToUpdate)
  );

  if (!isValid) {
    res.status(400).send({
      error: "Invalid update request!",
    });
  }
  try {
    if (Object.values(req.body).length === 0) {
      return throwError("Body is required");
    }
    const _id = req.params.id;
    const post = await Post.findOne({ _id, user: req.user._id });
    if (!post) {
      return res.status(404).send();
    }
    toUpdate.forEach((update) => (post[update] = req.body[update]));
    await post.save();
    res.send(post);
    GenericSuccess(`PUT /updatePostById`);
  } catch (error) {
    res.status(400).send(error);
    GenericError(`PUT /updatePostById   ${error}`);
  }
});

module.exports = router;