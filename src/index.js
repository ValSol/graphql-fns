const composeGql = require('./other/composeGql');
const composeGqlTypes = require('./types/composeGqlTypes');
const composeGqlResolvers = require('./resolvers/composeGqlResolvers');
const { default: Admin } = require('./admin/components/Admin');

module.exports = {
  composeGql,
  composeGqlResolvers,
  composeGqlTypes,
  Admin,
};
