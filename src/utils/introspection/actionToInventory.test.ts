/* eslint-env jest */
import type { EntityConfig, TangibleEntityConfig } from '../../tsTypes';
import type { ActionToParse, ParsedAction } from './tsTypes';

import actionToInventory from './actionToInventory';

describe('actionToInventory', () => {
  const placeConfig = {} as TangibleEntityConfig;
  const personConfig = {} as EntityConfig;

  const countryConfig: EntityConfig = {
    name: 'Country',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        type: 'textFields',
      },
    ],
    relationalFields: [
      {
        name: 'places',
        oppositeName: 'country',
        config: placeConfig,
        type: 'relationalFields',
        array: true,
        parent: true,
      },
    ],
  };

  Object.assign(placeConfig, {
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
        oppositeName: 'places',
        config: countryConfig,
        type: 'relationalFields',
      },
      {
        name: 'citizens',
        oppositeName: 'place',
        config: personConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
    ],
  });

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
        oppositeName: 'fellows',
        array: true,
        config: personConfig,
        type: 'relationalFields',
      },
      {
        name: 'fellows',
        oppositeName: 'friends',
        config: personConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
      {
        name: 'place',
        oppositeName: 'citizens',
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

  const allEntityConfigs = {
    Person: personConfig,
    Place: placeConfig,
    Country: countryConfig,
  };

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
      descendantKey: 'ForCabinet',
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
      descendantKey: 'ForCabinet',
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
