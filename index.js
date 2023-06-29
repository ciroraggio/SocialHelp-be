const express = require("express");
var bodyParser = require('body-parser'); 

const cors = require("cors");
const { GenericSuccess } = require("./utils/LoggerUtils");
const port = process.env.PORT || 3001;
const userRoutes = require("./src/routes/UserRoutes");
const postRoutes = require("./src/routes/PostRoutes");
const proposedResolutionRoutes = require("./src/routes/ProposedResolutionRoutes");

require("./src/db/config");
require("dotenv").config();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  optionsSuccessStatus: 200,
};

const maintenanceMode = async (res) => {
  const allMethods = ["GET", "POST", "PUT", "DELETE"];
  if (allMethods.some((method) => method === req.method)) {
    res.status(503).send("SocialHelp server under maintenance");
  }
};

const app = express();
app.use(bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));

app.use(express.json());

app.use(cors(corsOptions));

app.use(userRoutes).use(postRoutes).use(proposedResolutionRoutes);

app.listen(port, () => {
  GenericSuccess(`SocialHelp server is up on port ${port}`);
});
