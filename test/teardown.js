const mongoose = require('mongoose');

// eslint-disable-next-line func-names
module.exports = async function () {
  mongoose.connection.close(() => {
    process.exit(0);
  });
};
