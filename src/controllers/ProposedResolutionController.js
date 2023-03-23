// Import the necessary models and dependencies
const express = require("express");
const router = express.Router();
const ProposedResolution = require("../models/proposedResolutions");
const Post = require("../models/post");
const { GenericSuccess, GenericError } = require("../../utils/LoggerUtils");
const auth = require("../middleware/auth");

router.post("/resolution/createResolution", auth, async (req, res) => {
  try {
    const { text, user, post } = req.body;

    const proposedResolution = new ProposedResolution({
      text,
      user,
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
  const canUpdate = ["text", "status"];
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
    res.status(400).json({ message: error });
    GenericError(`PUT /updateResolutionById   ${error}`);
  }
});

module.exports = router;