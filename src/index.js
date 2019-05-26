const composeGql = require('./other/composeGql');
const composeGqlTypes = require('./types/composeGqlTypes');
const composeGqlResolvers = require('./resolvers/composeGqlResolvers');
const { default: ThingForm } = require('./admin/components/ThingForm');

module.exports = {
  composeGql,
  composeGqlResolvers,
  composeGqlTypes,
  ThingForm,
};
