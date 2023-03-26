const jwt = require("jsonwebtoken");
const { throwError, GenericError, GenericSuccess } = require("../../utils/LoggerUtils");
const User = require("../models/user");
require('dotenv').config();

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const jwtDecoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: jwtDecoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throwError("Cannot find user");
    }
    req.token = token
    req.user = user
    // GenericSuccess(`${user.email} auth verified!`)
    next();
  } catch (error) {
    res.status(401).send({ error: "Authentication failed." });
    GenericError(`auth error  ${error}`);
  }
};

module.exports = auth;
