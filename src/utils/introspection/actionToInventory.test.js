// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import actionToInventory from './actionToInventory';

describe('actionToInventory', () => {
  const countryConfig: ThingConfig = {
    name: 'Country',
    textFields: [
      {
        name: 'title',
      },
    ],
  };
  const placeConfig: ThingConfig = {
    name: 'Place',
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
  //   name: 'getThing',
  //   specificName: ({ name }) => `get${name}`,
  //   argNames: () => [],
  //   argTypes: () => [],
  //   type: ({ name }) => `${name}!`,
  //   config: (thingConfig) => thingConfig,
  // };

  // const ForCatalog: DerivativeAttributes = {
  //   suffix: 'ForCatalog',
  //   allow: {
  //     Person: ['thingsByUnique', 'childThings', 'childThing'],
  //     Place: ['childThing'],
  //     Country: ['childThing'],
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

  const thingConfigs = { Person: personConfig, Place: placeConfig, Country: countryConfig };
  // const queryName = 'getThing';
  // const custom = { Query: { [queryName]: signatureMethods } };
  // const derivative = { ForCatalog };

  // const generalConfig = { thingConfigs, custom, derivative };

  const prefixToPermission = {
    ForCabinet: 'insider',
  };

  test('have to return inventoryByPermissions with  thingsByUnique: [Person]', () => {
    const actionToParse = {
      actionType: 'Query',
      actionName: 'thingsByUnique',
      thingName: 'Person',
    };

    const parsedAction = {
      creationType: 'standard',
      thingConfig: thingConfigs.Person,
      baseAction: '',
      suffix: 'ForCabinet',
    };

    const inventoryByPermissions = {};

    const expectedResult = {
      insider: {
        name: 'insider',
        include: {
          Query: {
            thingsByUnique: ['Person'],
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

  test('have to return inventoryByPermissions with  thingsByUnique: [Place]', () => {
    const actionToParse = {
      actionType: 'Query',
      actionName: 'thingsByUnique',
      thingName: 'Place',
    };

    const parsedAction = {
      creationType: 'standard',
      thingConfig: thingConfigs.Place,
      baseAction: '',
      suffix: 'ForCabinet',
    };

    const inventoryByPermissions = {
      insider: {
        name: 'insider',
        include: {
          Query: {
            thingsByUnique: ['Person'],
          },
        },
      },
    };

    const expectedResult = {
      insider: {
        name: 'insider',
        include: {
          Query: {
            thingsByUnique: ['Person', 'Place'],
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
