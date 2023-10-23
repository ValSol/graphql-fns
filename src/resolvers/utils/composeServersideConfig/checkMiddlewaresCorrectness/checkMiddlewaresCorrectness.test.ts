/* eslint-env jest */
import type {
  DescendantAttributes,
  TangibleEntityConfig,
  GeneralConfig,
} from '../../../../tsTypes';

import checkMiddlewaresCorrectness from '.';

describe('checkMiddlewaresCorrectness', () => {
  const personConfig = {} as TangibleEntityConfig;

  const placeConfig: TangibleEntityConfig = {
    name: 'Place',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        required: true,
        type: 'textFields',
      },
    ],
    duplexFields: [
      {
        name: 'visitors',
        oppositeName: 'favoritePlace',
        array: true,
        config: personConfig,
        type: 'duplexFields',
      },
    ],

    relationalFields: [
      {
        name: 'citizens',
        oppositeName: 'location',
        config: personConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
    ],
  };

  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',

    textFields: [
      {
        name: 'firstName',
        required: true,
        type: 'textFields',
      },
      {
        name: 'lastName',
        required: true,
        type: 'textFields',
      },
    ],

    duplexFields: [
      {
        name: 'favoritePlace',
        oppositeName: 'visitors',
        config: placeConfig,
        type: 'duplexFields',
      },
    ],

    relationalFields: [
      {
        name: 'friends',
        oppositeName: 'fellows',
        config: personConfig,
        array: true,
        required: true,
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
        name: 'enemies',
        oppositeName: 'opponents',
        config: personConfig,
        array: true,
        type: 'relationalFields',
      },
      {
        name: 'opponents',
        oppositeName: 'enemies',
        config: personConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
      {
        name: 'location',
        oppositeName: 'citizens',
        config: placeConfig,
        required: true,
        type: 'relationalFields',
      },
    ],
  });

  const ForView: DescendantAttributes = {
    descendantKey: 'ForView',
    allow: {
      Person: ['entity', 'entities'],
      Place: ['entityCount', 'entitiesThroughConnection'],
    },
  };

  const descendant = { ForView };

  const allEntityConfigs = { Person: personConfig, Place: placeConfig };

  test('should check without "inventory"', () => {
    const generalConfig = { allEntityConfigs, descendant };

    const middlewares = {
      PersonCountForView: () => {},
      PlaceCountForView: () => {},
      PlaceForView: () => {},
      PersonCount: 'test',
      Place: () => {},
      SignOut: true,
    };

    const result = checkMiddlewaresCorrectness(middlewares as any, generalConfig);

    const expectedResult = {
      unfound: ['PersonCountForView', 'PlaceForView', 'SignOut'],
      noFunc: ['PersonCount'],
    };
    expect(result).toEqual(expectedResult);
  });

  test('should check with "inventory"', () => {
    const inventory = {
      name: '',
      include: { Query: { entityCountForView: ['Place'], entityCount: ['Person'] } },
    };

    const generalConfig = { allEntityConfigs, descendant, inventory };

    const middlewares = {
      PersonCountForView: () => {},
      PersonForView: () => {},
      PlaceCountForView: () => {},
      PlaceForView: () => {},
      PersonCount: () => {},
      Place: () => {},
      SignOut: () => {},
    };

    const result = checkMiddlewaresCorrectness(middlewares as any, generalConfig);

    const expectedResult = {
      unfound: ['PersonCountForView', 'PersonForView', 'PlaceForView', 'Place', 'SignOut'],
      noFunc: [],
    };
    expect(result).toEqual(expectedResult);
  });
});
