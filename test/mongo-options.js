const mongoOptions = {
  poolSize: 5,
  promiseLibrary: global.Promise,
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
};

module.exports = mongoOptions;
