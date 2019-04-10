const NodeEnvironment = require('jest-environment-node');

class MongoEnvironment extends NodeEnvironment {
  async teardown() {
    console.log('Teardown MongoDB Test Environment');

    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = MongoEnvironment;
