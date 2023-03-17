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
    if(user){
      const token = await user.generateJWT();
      res.send({ user, token });
      return GenericSuccess(`POST /login user: ${user.username}: ${user.email}`);
    }
    throwError("User not found")
  } catch (error) {
    res.status(400).send(error);
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
    GenericSuccess(`POST /logout`);
  } catch (error) {
    res.status(500).send(error);
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
    res.status(500).send(error);
    GenericError(`POST /logoutAll  ${error}`);
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
    res.status(400).send(error);
    GenericError(`POST /createUser  ${error}`);
  }
});

//get user in session
router.get("/user/getCurrentUser", auth, async (req, res) => {
  try {
    res.send(req.user);
    GenericSuccess("GET /getCurrentUser");
  } catch (error) {
    res.status(500).send(error);
    GenericError(`GET /getCurrentUser  ${error}`);
  }
});

//get user in session and update it
router.put("/user/updateCurrentUser", auth, async (req, res) => {
  const toUpdate = Object.keys(req.body);
  const canUpdate = ["name", "age", "email", "password"];
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
    res.status(400).send(error);
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
    res.status(500).send(error);
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

module.exports = router;
