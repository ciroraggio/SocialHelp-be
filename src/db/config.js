const mongoose = require("mongoose");
const url = `mongodb://${process.env.MONGO_URL}:${process.env.MONGO_PORT}`;
const dbName = "socialhelp";
const mongooseConnect = `${url}/${dbName}`;
mongoose.connect(mongooseConnect);

