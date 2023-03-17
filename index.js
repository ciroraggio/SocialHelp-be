const express = require("express");
const cors = require("cors");
const { GenericSuccess } = require("./utils/LoggerUtils");
const app = express();
const port = process.env.PORT || 3001;
const userController = require("./src/repository/UserController");
const postController = require("./src/repository/PostController");
require("./src/db/mongoose");
require("dotenv").config();

const maintenanceMode = async (res) => {
  const allMethods = ["GET", "POST", "PUT", "DELETE"];
  if (allMethods.some((method) => method === req.method)) {
    res.status(503).send("Server under maintenance");
  }
};
const corsOptions = {
  origin: ["http://localhost:3000"],
};

// app.use(async (req, res, next) => {

// });

app.use(express.json()).use(userController).use(postController);
app.use(cors(corsOptions));
app.listen(port, () => {
  GenericSuccess(`Server is up on port ${port}`);
});
