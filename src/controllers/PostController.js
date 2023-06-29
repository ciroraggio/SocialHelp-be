const { GenericSuccess, GenericError } = require("../../utils/LoggerUtils");
const Post = require("../models/post");
const User = require("../models/user");

exports.createPost = async (req, res) => {
  try {
    if (req.body.description && req.body.location) {
      const post = new Post({
        ...req.body,
        user: req.user._id,
      });
      await post.save();
      res.status(201).send(post);
      return GenericSuccess("POST /createPost");
    }
    throw new Error("Malformed body");
  } catch (error) {
    res.status(400).json({ message: error });
    GenericError(`POST /createPost  ${error}`);
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({ _id, user: req.user._id });
    if (!post) {
      return res.status(404).send();
    }
    res.send(post);
    GenericSuccess(`GET /getPostById  ${post}`);
  } catch (error) {
    res.status(500).json({ message: error });
    GenericError(`GET /getPostById   ${error}`);
  }
};

exports.getAllPostsByUser = async (req, res) => {
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
        sort,
      },
    });
    res.send(req.user.posts);
    GenericSuccess(`GET /getAllPostsByUser`);
  } catch (error) {
    res.status(500).json({ message: error });
    GenericError(`GET /getAllPostsByUser   ${error}`);
  }
};

exports.getAllFeedPostsByUser = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    const following = user.following;

    // Find all posts created by users the user is following and current user
    const posts = await Post.find({
      $or: [{ user: userId }, { user: { $in: following } }],
    })
      .populate("user", [
        "name",
        "surname",
        "username",
        "verified",
        "profilePicture",
      ])
      .populate("proposedResolutions");
    res.send(posts);
    GenericSuccess(`GET /getAllFeedPostsByUser`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error finding posts");
    GenericError(`GET /getAllFeedPostsByUser   ${err}`);
  }
};

exports.deletePostById = async (req, res) => {
  try {
    const _id = req.params.id;
    const post = await Post.findOneAndDelete({ _id, user: req.user._id });
    if (!post) {
      return res.status(404).send();
    }
    res.json({ message: `Post deleted` });
    GenericSuccess(`DELETE /deletePostById  ${post}`);
  } catch (error) {
    res.status(500).json({ message: error });
    GenericError(`DELETE /deletePostById   ${error}`);
  }
};

exports.updatePostById = async (req, res) => {
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
    res.status(400).json({ message: error });
    GenericError(`PUT /updatePostById   ${error}`);
  }
};
