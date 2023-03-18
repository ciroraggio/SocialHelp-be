const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Post = require("./post");
const { throwError, GenericError } = require("../../utils/LoggerUtils");
require("dotenv").config();
// Hash the password
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    surname: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: Buffer,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(email) {
        if (!validator.default.isEmail(email)) {
          return throwError("Invalid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(pass) {
        if (validator.default.contains(pass.toLowerCase(), "password")) {
          return throwError('Password cannot contain "password"');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    location: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 5
    },
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    // aggiungerà automaticamente due campi al documento: createdAt e updatedAt. 
    // Questi campi conterranno la data e l'ora della creazione e dell'ultima modifica del documento.
    timestamps: true,
  },

);

userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "user",
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userToSend = user.toObject();
  delete userToSend.password;
  delete userToSend.tokens;
  delete userToSend.profilePicture;
  return userToSend;
};

userSchema.methods.generateJWT = async function () {
  // è un metodo d'istanza quindi recupero l'utente
  const user = this;
  // genero il token con l'id univoco e creo di conseguenza un sotto-documento
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  // salvo nel db il token
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (username, password) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return throwError("Credentials error");
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return throwError("Credentials error");
    }
    return user;
  } catch (err) {
    GenericError(err);
  }
};

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.pre("remove", async function (next) {
  const user = this;
  await Post.deleteMany({ user: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
