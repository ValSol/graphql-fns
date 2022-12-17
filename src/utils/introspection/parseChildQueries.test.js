// @flow
/* eslint-env jest */
import type { ActionSignatureMethods, DerivativeAttributes, EntityConfig } from '../../flowTypes';

import parseChildQueries from './parseChildQueries';

describe('parseChildQueries', () => {
  const countryConfig: EntityConfig = {
    name: 'Country',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
      },
    ],
  };
  const placeConfig: EntityConfig = {
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
  const personConfig: EntityConfig = {};
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
    name: 'getEntity',
    specificName: ({ name }) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    type: ({ name }) => `${name}!`,
    config: (entityConfig) => entityConfig,
  };

  const ForCatalog: DerivativeAttributes = {
    derivativeKey: 'ForCatalog',
    allow: {
      Person: ['entitiesByUnique', 'childEntities', 'childEntity'],
      Place: ['childEntity'],
      Country: ['childEntity'],
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

  const allEntityConfigs = { Person: personConfig, Place: placeConfig, Country: countryConfig };
  const queryName = 'getEntity';
  const custom = { Query: { [queryName]: signatureMethods } };
  const derivative = { ForCatalog };

  const generalConfig = { allEntityConfigs, custom, derivative };

  test('have to return inventoryByPermissions with  entitiesByUnique: [Person]', () => {
    const childQueries = ['childEntities:PersonForCatalog', 'childEntity:PlaceForCatalog'];

    const expectedResult = [
      {
        actionName: 'childEntitiesForCatalog',
        baseAction: 'childEntities',
        derivativeKey: 'ForCatalog',
        entityName: 'Person',
      },
      {
        actionName: 'childEntityForCatalog',
        baseAction: 'childEntity',
        derivativeKey: 'ForCatalog',
        entityName: 'Place',
      },
    ];

    const result = parseChildQueries(childQueries, generalConfig);

    expect(result).toEqual(expectedResult);
  });
});
