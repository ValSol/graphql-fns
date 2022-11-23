// @flow
/* eslint-env jest */
import type { ActionSignatureMethods, DerivativeAttributes, ThingConfig } from '../../flowTypes';

import parseChildQueries from './parseChildQueries';

describe('parseChildQueries', () => {
  const countryConfig: ThingConfig = {
    name: 'Country',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
      },
    ],
  };
  const placeConfig: ThingConfig = {
    name: 'Place',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
      },
    ],
    relationalFields: [
      {
        name: 'country',
        config: countryConfig,
      },
    ],
  };
  const personConfig: ThingConfig = {};
  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [
      {
        name: 'firstName',
      },
      {
        name: 'secondName',
      },
    ],
    relationalFields: [
      {
        name: 'friends',
        array: true,
        config: personConfig,
      },
      {
        name: 'place',
        config: placeConfig,
      },
    ],
    duplexFields: [
      {
        name: 'parent',
        config: personConfig,
        oppositeName: 'children',
      },
      {
        name: 'children',
        array: true,
        config: personConfig,
        oppositeName: 'parent',
      },
    ],
  });

  const signatureMethods: ActionSignatureMethods = {
    name: 'getThing',
    specificName: ({ name }) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    type: ({ name }) => `${name}!`,
    config: (thingConfig) => thingConfig,
  };

  const ForCatalog: DerivativeAttributes = {
    suffix: 'ForCatalog',
    allow: {
      Person: ['thingsByUnique', 'childThings', 'childThing'],
      Place: ['childThing'],
      Country: ['childThing'],
    },

    derivativeFields: {
      Person: {
        friends: 'ForCatalog',
        place: 'ForCatalog',
        parent: 'ForCatalog',
        children: 'ForCatalog',
      },
      Place: {
        country: 'ForCatalog',
      },
    },
  };

  const thingConfigs = { Person: personConfig, Place: placeConfig, Country: countryConfig };
  const queryName = 'getThing';
  const custom = { Query: { [queryName]: signatureMethods } };
  const derivative = { ForCatalog };

  const generalConfig = { thingConfigs, custom, derivative };

  test('have to return inventoryByPermissions with  thingsByUnique: [Person]', () => {
    const childQueries = ['childThings:PersonForCatalog', 'childThing:PlaceForCatalog'];

    const expectedResult = [
      {
        actionName: 'childThingsForCatalog',
        baseAction: 'childThings',
        suffix: 'ForCatalog',
        thingName: 'Person',
      },
      {
        actionName: 'childThingForCatalog',
        baseAction: 'childThing',
        suffix: 'ForCatalog',
        thingName: 'Place',
      },
    ];

    const result = parseChildQueries(childQueries, generalConfig);

    expect(result).toEqual(expectedResult);
  });
});
