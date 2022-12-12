// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../flowTypes';

import actionToInventory from './actionToInventory';

describe('actionToInventory', () => {
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

  // const signatureMethods: ActionSignatureMethods = {
  //   name: 'getEntity',
  //   specificName: ({ name }) => `get${name}`,
  //   argNames: () => [],
  //   argTypes: () => [],
  //   type: ({ name }) => `${name}!`,
  //   config: (entityConfig) => entityConfig,
  // };

  // const ForCatalog: DerivativeAttributes = {
  //   suffix: 'ForCatalog',
  //   allow: {
  //     Person: ['entitiesByUnique', 'childEntities', 'childEntity'],
  //     Place: ['childEntity'],
  //     Country: ['childEntity'],
  //   },

  //   derivativeFields: {
  //     Person: {
  //       friends: 'ForCatalog',
  //       place: 'ForCatalog',
  //       parent: 'ForCatalog',
  //       children: 'ForCatalog',
  //     },
  //     Place: {
  //       country: 'ForCatalog',
  //     },
  //   },
  // };

  const allEntityConfigs = { Person: personConfig, Place: placeConfig, Country: countryConfig };
  // const queryName = 'getEntity';
  // const custom = { Query: { [queryName]: signatureMethods } };
  // const derivative = { ForCatalog };

  // const generalConfig = { allEntityConfigs, custom, derivative };

  const prefixToPermission = {
    ForCabinet: 'insider',
  };

  test('have to return inventoryByPermissions with  entitiesByUnique: [Person]', () => {
    const actionToParse = {
      actionType: 'Query',
      actionName: 'entitiesByUnique',
      entityName: 'Person',
    };

    const parsedAction = {
      creationType: 'standard',
      entityConfig: allEntityConfigs.Person,
      baseAction: '',
      suffix: 'ForCabinet',
    };

    const inventoryByPermissions = {};

    const expectedResult = {
      insider: {
        name: 'insider',
        include: {
          Query: {
            entitiesByUnique: ['Person'],
          },
        },
      },
    };

    const result = actionToInventory(
      actionToParse,
      parsedAction,
      inventoryByPermissions,
      prefixToPermission,
    );

    expect(result).toEqual(expectedResult);
  });

  test('have to return inventoryByPermissions with  entitiesByUnique: [Place]', () => {
    const actionToParse = {
      actionType: 'Query',
      actionName: 'entitiesByUnique',
      entityName: 'Place',
    };

    const parsedAction = {
      creationType: 'standard',
      entityConfig: allEntityConfigs.Place,
      baseAction: '',
      suffix: 'ForCabinet',
    };

    const inventoryByPermissions = {
      insider: {
        name: 'insider',
        include: {
          Query: {
            entitiesByUnique: ['Person'],
          },
        },
      },
    };

    const expectedResult = {
      insider: {
        name: 'insider',
        include: {
          Query: {
            entitiesByUnique: ['Person', 'Place'],
          },
        },
      },
    };

    const result = actionToInventory(
      actionToParse,
      parsedAction,
      inventoryByPermissions,
      prefixToPermission,
    );

    expect(result).toEqual(expectedResult);
  });
});
