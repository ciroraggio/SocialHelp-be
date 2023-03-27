const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const {
  GenericError,
  GenericSuccess,
  throwError,
} = require("../../utils/LoggerUtils");
const User = require("../models/user");
const router = new express.Router();
const auth = require("../middleware/auth");
const upload = multer({
  limits: {
    fileSize: 1000000, //1 mb
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png)/)) {
      cb(new Error("File must be .jpg/.jpeg/.png"));
    }
    cb(undefined, true);
  },
});

router.post("/login", async (req, res) => {
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
});

router.post("/logout", auth, async (req, res) => {
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
});

router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
    GenericSuccess(`POST /logoutAll`);
  } catch (error) {
    res.status(500).json({ message: error });
    GenericError(`POST /logoutAll  ${error}`);
  }
});

router.get("/user/getAllUsers", auth, async (req, res) => {
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
        };
      })
    );
    // GenericSuccess(`GET /getAllUsers`);
  } catch (error) {
    res.status(400).json({ message: error });
    GenericError(`GET /getAllUsers  ${error}`);
  }
});

//create user
router.post("/user/createUser", async (req, res) => {
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
});

//get user in session
router.get("/user/getCurrentUser", auth, async (req, res) => {
  try {
    res.send(req.user);
    GenericSuccess("GET /getCurrentUser");
  } catch (error) {
    res.status(500).json({ message: error });
    GenericError(`GET /getCurrentUser  ${error}`);
  }
});

//get user in session and update it
router.put("/user/updateCurrentUser", auth, async (req, res) => {
  const toUpdate = Object.keys(req.body);
  const canUpdate = [
    "name",
    "surname",
    "email",
    "password",
    "phone",
    "location",
    "biography"
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
});

//get user in session and remove it from db
router.delete("/user/deleteCurrentUser", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
    GenericSuccess(`GET /deleteCurrentUser`);
  } catch (error) {
    res.status(500).json({ message: error });
    GenericError(`GET /deleteCurrentUser   ${error}`);
  }
});

router.get("/user/getProfilePicture/:id", async (req, res) => {
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
});

router.post(
  "/user/uploadProfilePicture",
  auth,
  upload.single("picture"),
  async (req, res) => {
    const bufferedImage = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.profilePicture = bufferedImage;
    await req.user.save();
    res.send();
    GenericSuccess(" POST /user/uploadProfilePicture");
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
    GenericError(`POST /user/uploadProfilePicture ${err}`);
  }
);

router.delete("/user/deleteProfilePicture", auth, async (req, res) => {
  req.user.profilePicture = undefined;
  await req.user.save();
  res.send();
  GenericSuccess(" DELETE /user/deleteProfilePicture");
});

// Aggiunge un utente alla lista following
router.post("/user/follow", auth, async (req, res) => {
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
});

// Rimuove un utente dalla lista following
router.post("/user/removeFollow", auth, async (req, res) => {
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
});

module.exports = router;
