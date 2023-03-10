const chalk = require("chalk");

const GenericError = (err) => {
  console.log(`${chalk.inverse.red.bold("ERROR")} : ${err}`);
};

const GenericSuccess = (msg) => {
  console.log(`${chalk.inverse.green.bold("SUCCESS")} : ${msg}`);
};

const throwError = (err) => {
  throw new Error(err);
};

module.exports = {
  GenericError: GenericError,
  GenericSuccess: GenericSuccess,
  throwError: throwError,
};
