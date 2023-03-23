const express = require("express");
const cors = require("cors");
const { GenericSuccess } = require("./utils/LoggerUtils");
const port = process.env.PORT || 3001;
const userController = require("./src/controllers/UserController");
const postController = require("./src/controllers/PostController");
const proposedResolutionController = require("./src/controllers/ProposedResolutionController");
require("./src/db/mongoose");
require("dotenv").config();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  optionsSuccessStatus: 200,
};

const maintenanceMode = async (res) => {
  const allMethods = ["GET", "POST", "PUT", "DELETE"];
  if (allMethods.some((method) => method === req.method)) {
    res.status(503).send("Server under maintenance");
  }
};

const app = express();

app.use(express.json());

app.use(cors(corsOptions));

app.use(userController).use(postController).use(proposedResolutionController);

app.listen(port, () => {
  GenericSuccess(`Server is up on port ${port}`);
});
