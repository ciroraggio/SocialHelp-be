const { GenericSuccess, GenericError } = require("../../utils/LoggerUtils");
const User = require("../models/user");

exports.login = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    );
    if (user) {
      const token = await user.generateJWT();
      res.send({ user, token });
      return GenericSuccess(
        `POST /login user: ${user.username} - ${user.email}`
      );
    }
    throwError("User not found");
  } catch (error) {
    res.status(400).json({ message: error });
    GenericError(`POST /login  ${error}`);
  }
};

exports.logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send();
    GenericSuccess(`POST /logout user disconnected: ${req.user.email}`);
  } catch (error) {
    res.status(500).json({ message: error });
    GenericError(`POST /logout  ${error}`);
  }
};

exports.logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
    GenericSuccess(`POST /logoutAll`);
  } catch (error) {
    res.status(500).json({ message: error });
    GenericError(`POST /logoutAll  ${error}`);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } });
    res.status(200).send(
      users.map((user) => {
        return {
          id: user._id,
          name: user.name,
          surname: user.surname,
          location: user.location,
          username: user.username,
          biography: user.biography,
          following: user.following.filter((id) => id.toString() !== user._id),
          verified: user.verified,
          profilePicture: user.profilePicture,
        };
      })
    );
    // GenericSuccess(`GET /getAllUsers`);
  } catch (error) {
    res.status(400).json({ message: error });
    GenericError(`GET /getAllUsers  ${error}`);
  }
};

exports.createUser = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = user.generateJWT();
    res.status(201).send({ user, token });
    GenericSuccess(`POST /createUser`);
  } catch (error) {
    res.status(400).json({ message: error });
    GenericError(`POST /createUser  ${error}`);
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const token = await user.generateJWT();
      res.send({ user, token });
      return GenericSuccess("GET /getCurrentUser");
    }
    throwError("User not found");
  } catch (error) {
    res.status(500).json({ message: error });
    GenericError(`GET /getCurrentUser  ${error}`);
  }
};

exports.updateCurrentUser = async (req, res) => {
  const toUpdate = Object.keys(req.body);
  const canUpdate = [
    "name",
    "surname",
    "email",
    "password",
    "phone",
    "location",
    "biography",
  ];
  const isValid = toUpdate.every((fieldToUpdate) =>
    canUpdate.includes(fieldToUpdate)
  );
  if (!isValid) {
    return res.status(400).send({
      error: "Invalid update request!",
    });
  }
  try {
    if (Object.values(req.body).length === 0) {
      return throwError("Body is required");
    }
    toUpdate.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
    GenericSuccess(`PUT /updateCurrentUser`);
  } catch (error) {
    res.status(400).json({ message: error });
    GenericError(`PUT /updateCurrentUser   ${error}`);
  }
};

exports.deleteCurrentUser = async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
    GenericSuccess(`GET /deleteCurrentUser`);
  } catch (error) {
    res.status(500).json({ message: error });
    GenericError(`GET /deleteCurrentUser   ${error}`);
  }
};

exports.getProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.profilePicture) {
      throwError();
    }
    res.set("Content-Type", "image/jpg");
    res.send(user.profilePicture);
    GenericSuccess("GET /user/getProfilePicture");
  } catch (err) {
    res.status(404).send();
    GenericError(`GET /user/getProfilePicture ${err}`);
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    req.user.profilePicture = req.body.data;
    await req.user.save();
    res.status(200).send({ message: "Profile picture updated" });
    GenericSuccess(" POST /user/uploadProfilePicture");
  } catch (error) {
    res.status(400).send({ error: error.message });
    GenericError(`POST /user/uploadProfilePicture ${err}`);
  }
};

exports.deleteProfilePicture = async (req, res) => {
  req.user.profilePicture = undefined;
  await req.user.save();
  res.send();
  GenericSuccess(" DELETE /user/deleteProfilePicture");
};

exports.follow = async (req, res) => {
  try {
    const user = req.user;
    const followingId = req.body.followingId;
    if (!user || !followingId) {
      return res.status(404).send({ error: "User not found" });
    }
    if (user.following.includes(followingId)) {
      return res.status(400).send({ error: "User already followed" });
    }
    user.following.push(followingId);
    await user.save();
    res.status(200).send({ message: "User followed" });
    GenericSuccess("POST /user/follow");
  } catch (error) {
    res.status(500).send({ error: error.message });
    GenericError(`POST /user/follow ${error.message}`);
  }
};

exports.removeFollow = async (req, res) => {
  try {
    const followingId = req.body.followingId;
    if (!req.user || !followingId) {
      return res.status(404).send({ error: "User not found" });
    }
    if (!req.user.following.includes(followingId)) {
      return res.status(400).send({ error: "User not followed" });
    }
    req.user.following = req.user.following.filter(
      (id) => id.toString() !== followingId
    );
    await req.user.save();
    res.status(200).send({ message: "User unfollowed" });
    GenericSuccess("POST /user/removeFollow");
  } catch (error) {
    res.status(500).send({ error: error.message });
    GenericError(`POST /user/removeFollow ${error.message}`);
  }
};

