const mongoose = require("mongoose");

const proposedResolutionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true }, // testo della risoluzione proposta
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // utente che invia la proposta
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true }, // post a cui si riferisce la proposta
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const ProposedResolution = mongoose.model(
  "ProposedResolution",
  proposedResolutionSchema
);

module.exports = ProposedResolution;
