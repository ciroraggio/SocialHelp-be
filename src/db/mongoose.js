const mongoose = require("mongoose");
const url = "mongodb://mongo:27017";
const dbName = "socialhelp";
const mongooseConnect = `${url}/${dbName}`;
mongoose.connect(mongooseConnect);

