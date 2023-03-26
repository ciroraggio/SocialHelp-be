// Import the necessary models and dependencies
const express = require("express");
const router = express.Router();
const ProposedResolution = require("../models/proposedResolutions");
const Post = require("../models/post");
const { GenericSuccess, GenericError } = require("../../utils/LoggerUtils");
const auth = require("../middleware/auth");

router.post("/resolution/createResolution", auth, async (req, res) => {
  try {
    const { description, post } = req.body;

    const proposedResolution = new ProposedResolution({
      description,
      user: req.user._id,
      post,
    });

    await proposedResolution.save();

    // After creating the proposal we must add the ID to the post list
    await Post.findByIdAndUpdate(post, {
      $push: { proposedResolutions: proposedResolution._id },
    });
    GenericSuccess(`POST /createResolution`);
    res
      .status(200)
      .json({ message: "Proposed resolution created successfully" });
  } catch (err) {
    GenericError(`POST /createResolution  ${err}`);
    res.status(500).json({
      error: "An error occurred while creating the resolution",
    });
  }
});

// get all resolution by user
router.get("/resolution/getAllResolutionsByUser", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userPosts = await Post.find({ user: userId }).populate({
      path: "proposedResolutions",
      populate: [{ path: "user" }, { path: "post" }],
    });
    const proposedResolutions = userPosts.reduce(
      (acc, post) => acc.concat(post.proposedResolutions),
      []
    );
    const mappedResolutions = proposedResolutions.map((resolution) => ({
      _id: resolution._id,
      user: {
        name: resolution.user.name,
        surname: resolution.user.surname,
        username: resolution.user.username,
      },
      post: {
        _id: resolution.post._id,
        description: resolution.post.description,
        createdAt: resolution.post.createdAt,
      },
      status: resolution.status,
      description: resolution.description,
    }));
    GenericSuccess(`POST /getAllResolutionByUser`);
    res.status(200).json({ resolutions: mappedResolutions });
  } catch (err) {
    GenericError(`POST /getAllResolutionByUser  ${err}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get one resolution by id and delete it
// also delete proposed resolution id from the post
router.delete(
  "/resolution/deleteResolutionById/:id",
  auth,
  async (req, res) => {
    try {
      const _id = req.params.id;
      const post = await Post.findOne({ proposedResolutions: _id });
      if (!post) {
        return res.status(404).send();
      }
      const update = { $pull: { proposedResolutions: _id } };
      await post.updateOne(update);

      const proposedResolution = await Post.findOneAndDelete({ _id });
      if (!proposedResolution) {
        return res.status(404).send();
      }

      res.send({ message: `Resolution deleted` });
      GenericSuccess(`DELETE /deleteResolutionById  ${_id}`);
    } catch (error) {
      res.status(500).json({ message: error });
      GenericError(`DELETE /deleteResolutionById   ${error}`);
    }
  }
);

//get one resolution by id and update it
router.put("/resolution/updateResolutionById/:id", auth, async (req, res) => {
  const toUpdate = Object.keys(req.body);
  const canUpdate = ["description", "status"];
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
    const proposedResolution = await ProposedResolution.findOne({
      _id,
      user: req.user._id,
    });
    if (!resolution) {
      return res.status(404).send();
    }
    toUpdate.forEach(
      (update) => (proposedResolution[update] = req.body[update])
    );
    await proposedResolution.save();
    res.status(200).json({ message: "Update complete!" });
    GenericSuccess(`PUT /updateResolutionById`);
  } catch (error) {
    res.status(500).json({ error: "Error while updating resolution" });
    GenericError(`PUT /updateResolutionById   ${error}`);
  }
});

// Accept a proposed resolution and mark the others as rejected
router.put("/resolution/:id/accept", auth, async (req, res) => {
  try {
    const resolutionId = req.params.id;
    const resolution = await ProposedResolution.findByIdAndUpdate(
      { _id: resolutionId },
      { status: "accepted" }
    );

    // Mark all other proposals relating to the post as rejected
    const postId = resolution.post;
    await ProposedResolution.updateMany(
      { post: postId, _id: { $ne: resolutionId } },
      { status: "rejected" }
    );

    // Update the field of post proposals by accepting only the selected proposal
    await Post.findByIdAndUpdate(postId, {
      $set: { proposedResolutions: [resolutionId], solved: true },
    });

    res.status(200).json({ message: "Resolution accepted" });
    GenericSuccess(`PUT resolution/accept`);
  } catch (error) {
    res.status(500).json({ error: "Error while accepting resolution" });
    GenericError(`PUT resolution/accept   ${error}`);
  }
});

// Endpoint per rifiutare una proposta
router.put("/resolution/:id/reject", auth, async (req, res) => {
  try {
    const resolutionId = req.params.id;
    await ProposedResolution.findByIdAndUpdate(
      { _id: resolutionId },
      {
        status: "rejected",
      }
    );

    res.status(200).json({ message: "Resolution rejected" });
    GenericSuccess(`PUT resolution/rejected`);
  } catch (error) {
    res.status(500).json({ error: "Error while rejecting resolution" });
    GenericError(`PUT resolution/rejected   ${error}`);
  }
});

module.exports = router;
