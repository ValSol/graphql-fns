// @flow
/* eslint-env jest */

const fs = require('fs');

const composeGqlTypes = require('./types/composeGqlTypes');
const composeGqlResolvers = require('./resolvers/composeGqlResolvers');

describe('composeThingResolvers', () => {
  test('should create resolver for type', () => {
    const majorConfig = {
      name: 'Major',
      textFields: [
        {
          name: 'name',
          required: true,
        },
      ],
    };

    const cityConfig = {
      name: 'City',
      isEmbedded: true,
      textFields: [
        {
          name: 'name',
          required: true,
        },
      ],
      relationalFields: [
        {
          name: 'major',
          config: majorConfig,
        },
      ],
    };

    const addressConfig = {
      name: 'Address',
      isEmbedded: true,
      textFields: [
        {
          name: 'country',
          required: true,
        },
        {
          name: 'province',
        },
      ],
      embeddedFields: [
        {
          name: 'city',
          config: cityConfig,
          required: true,
        },
      ],
      relationalFields: [
        {
          name: 'major',
          config: majorConfig,
        },
      ],
    };

    const personConfig = {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      embeddedFields: [
        {
          name: 'location',
          config: addressConfig,
          required: true,
        },
      ],
      relationalFields: [
        {
          name: 'major',
          config: majorConfig,
        },
      ],
    };

    const thingConfigs = [personConfig, addressConfig, cityConfig, majorConfig];

    const generatedTypeDefs = composeGqlTypes(thingConfigs);

    const generatedResolvers = composeGqlResolvers(thingConfigs);

    console.log('************ createThingScalarResolver *************');
    const fileName = 'all-results.log';
    const delimiter = '***************************************\n';
    const result = `${delimiter}${generatedTypeDefs}\n${delimiter}${generatedResolvers}\n${delimiter}${JSON.stringify(
      generatedResolvers,
      null,
      ' ',
    )}\n${delimiter}`;
    fs.writeFileSync(fileName, result);
  });
});
