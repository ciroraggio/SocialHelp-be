const express = require("express");
const {
  GenericSuccess,
} = require("./utils/LoggerUtils");
const app = express();
const port = process.env.PORT || 3001;
const userRepository = require("./src/repository/UserRepository");
const postRepository = require("./src/repository/PostRepository");
require("./src/db/mongoose");
require('dotenv').config(); 

const maintenanceMode = async (res) => {
  const allMethods = ["GET", "POST", "PUT", "DELETE"];
  if (allMethods.some((method) => method === req.method)) {
    res.status(503).send("Server under maintenance");
  }
};

// app.use(async (req, res, next) => {
   
// });

app.use(express.json()).use(userRepository).use(postRepository);

app.listen(port, () => {
  GenericSuccess(`Server is up on port ${port}`);
});
