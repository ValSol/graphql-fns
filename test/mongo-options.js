const mongoOptions = {
  poolSize: 5,
  promiseLibrary: global.Promise,
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

module.exports = mongoOptions;
