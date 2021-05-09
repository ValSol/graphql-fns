const mongoOptions = {
  poolSize: 5,
  promiseLibrary: global.Promise,
  retryWrites: false,
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

module.exports = mongoOptions;
