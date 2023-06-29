const express = require("express");
const auth = require("../middleware/auth");
const proposedResolutionController = require("../controllers/ProposedResolutionController");
const router = express.Router();

router.post(
  "/resolution/createResolution",
  auth,
  proposedResolutionController.createResolution
);

// get all resolution by user
router.get(
  "/resolution/getAllResolutionsByUser",
  auth,
  proposedResolutionController.getAllResolutionByUser
);

// get one resolution by id and delete it
// also delete proposed resolution id from the post
router.delete(
  "/resolution/deleteResolutionById/:id",
  auth,
  proposedResolutionController.deleteResolutionById
);

//get one resolution by id and update it
router.put(
  "/resolution/updateResolutionById/:id",
  auth,
  proposedResolutionController.updateResolutionById
);

// Accept a proposed resolution and mark the others as rejected
router.put(
  "/resolution/:id/accept",
  auth,
  proposedResolutionController.acceptResolutionById
);

// Endpoint per rifiutare una proposta
router.put(
  "/resolution/:id/reject",
  auth,
  proposedResolutionController.rejectResolutionById
);

module.exports = router;
