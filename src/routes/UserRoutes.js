const express = require("express");
const auth = require("../middleware/auth");
const userController = require("../controllers/UserController");
const router = new express.Router();

// const upload = multer({
//   limits: {
//     fileSize: 1000000, //1 mb
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(jpeg|jpg|png)/)) {
//       cb(new Error("File must be .jpg/.jpeg/.png"));
//     }
//     cb(undefined, true);
//   },
// });

router.post("/login", userController.login);

router.post("/logout", auth, userController.logout);

router.post("/logoutAll", auth, userController.logoutAll);

router.get("/user/getAllUsers", auth, userController.getAllUsers);

//create user
router.post("/user/createUser", userController.createUser);

//get user in session
router.get("/user/getCurrentUser", auth, userController.getCurrentUser);

//get user in session and update it
router.put("/user/updateCurrentUser", auth, userController.updateCurrentUser);

//get user in session and remove it from db
router.delete("/user/deleteCurrentUser", auth, userController.deleteCurrentUser);

router.get("/user/getProfilePicture/:id", userController.getProfilePicture);

router.post("/user/uploadProfilePicture", auth, userController.uploadProfilePicture);

router.delete("/user/deleteProfilePicture", auth, userController.deleteProfilePicture);

// Aggiunge un utente alla lista following
router.post("/user/follow", auth, userController.follow);

// Rimuove un utente dalla lista following
router.post("/user/removeFollow", auth, userController.removeFollow);

module.exports = router;
