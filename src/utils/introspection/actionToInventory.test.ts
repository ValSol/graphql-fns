/* eslint-env jest */
import type { EntityConfig } from '../../tsTypes';
import type { ActionToParse, ParsedAction } from './tsTypes';

import actionToInventory from './actionToInventory';

describe('actionToInventory', () => {
  const countryConfig: EntityConfig = {
    name: 'Country',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        type: 'textFields',
      },
    ],
  };
  const placeConfig: EntityConfig = {
    name: 'Place',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        type: 'textFields',
      },
    ],
    relationalFields: [
      {
        name: 'country',
        config: countryConfig,
        type: 'relationalFields',
      },
    ],
  };
  const personConfig = {} as EntityConfig;
  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [
      {
        name: 'firstName',
        type: 'textFields',
      },
      {
        name: 'secondName',
        type: 'textFields',
      },
    ],
    relationalFields: [
      {
        name: 'friends',
        array: true,
        config: personConfig,
        type: 'relationalFields',
      },
      {
        name: 'place',
        config: placeConfig,
        type: 'relationalFields',
      },
    ],
    duplexFields: [
      {
        name: 'parent',
        config: personConfig,
        oppositeName: 'children',
        type: 'duplexFields',
      },
      {
        name: 'children',
        array: true,
        config: personConfig,
        oppositeName: 'parent',
        type: 'duplexFields',
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
  //   derivativeKey: 'ForCatalog',
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

  const allEntityConfigs = {
    Person: personConfig,
    Place: placeConfig,
    Country: countryConfig,
  };
  // const queryName = 'getEntity';
  // const custom = { Query: { [queryName]: signatureMethods } };
  // const derivative = { ForCatalog };

  // const generalConfig = { allEntityConfigs, custom, derivative };

  const prefixToPermission = {
    ForCabinet: 'insider',
  };

  test('have to return inventoryByRoles with  entitiesByUnique: [Person]', () => {
    const actionToParse: ActionToParse = {
      actionType: 'Query',
      actionName: 'entitiesByUnique',
      entityName: 'Person',
    };

    const parsedAction: ParsedAction = {
      creationType: 'standard',
      entityConfig: allEntityConfigs.Person,
      baseAction: '',
      derivativeKey: 'ForCabinet',
    };

    const inventoryByRoles: Record<string, any> = {};

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
      inventoryByRoles,
      prefixToPermission,
    );

    expect(result).toEqual(expectedResult);
  });

  test('have to return inventoryByRoles with  entitiesByUnique: [Place]', () => {
    const actionToParse: ActionToParse = {
      actionType: 'Query',
      actionName: 'entitiesByUnique',
      entityName: 'Place',
    };

    const parsedAction: ParsedAction = {
      creationType: 'standard',
      entityConfig: allEntityConfigs.Place,
      baseAction: '',
      derivativeKey: 'ForCabinet',
    };

    const inventoryByRoles = {
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
      inventoryByRoles,
      prefixToPermission,
    );

    expect(result).toEqual(expectedResult);
  });
});
