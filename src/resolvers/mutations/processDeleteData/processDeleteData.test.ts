/* eslint-env jest */
import type { TangibleEntityConfig } from '../../../tsTypes';

import processDeleteData from '.';

describe('processDeleteData', () => {
  test('should create object with simple fields', () => {
    const personConfig = {} as TangibleEntityConfig;
    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'visitors',
          oppositeName: 'favorites',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'curator',
          oppositeName: 'locations',
          config: personConfig,
          type: 'duplexFields',
        },
      ],

      relationalFields: [
        {
          name: 'owner',
          oppositeName: 'ownerships',
          config: personConfig,
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
          name: 'spouse',
          oppositeName: 'spouse',
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'locations',
          oppositeName: 'curator',
          config: placeConfig,
          array: true,
          type: 'duplexFields',
        },
        {
          name: 'favorites',
          oppositeName: 'visitors',
          config: placeConfig,
          array: true,
          type: 'duplexFields',
        },
      ],

      relationalFields: [
        {
          name: 'ownerships',
          oppositeName: 'owner',
          config: placeConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    });
    const data = {
      _id: '111',
      firstName: 'Vasya',
      lastName: 'Pupkin',
      spouse: '222',
      location: '333',
      locations: ['444', '555'],
      favorites: ['666', '777'],
    };

    const expectedResult = new Map();
    expectedResult.set(personConfig, [
      {
        deleteOne: {
          filter: {
            _id: '111',
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '222',
          },
          update: {
            $unset: {
              spouse: 1,
            },
          },
        },
      },
    ]);

    expectedResult.set(placeConfig, [
      {
        updateOne: {
          filter: {
            _id: '333',
          },
          update: {
            $pull: {
              citizens: '111',
            },
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '444',
          },
          update: {
            $unset: {
              curator: 1,
            },
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '555',
          },
          update: {
            $unset: {
              curator: 1,
            },
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '666',
          },
          update: {
            $pull: {
              visitors: '111',
            },
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '777',
          },
          update: {
            $pull: {
              visitors: '111',
            },
          },
        },
      },
      {
        updateMany: {
          filter: {
            owner: '111',
          },
          update: {
            $unset: {
              owner: 1,
            },
          },
        },
      },
    ]);

    const result = processDeleteData(data, null, personConfig, true);

    expect(result).toEqual(expectedResult);
  });

  test('should return result for toDelete', () => {
    const personConfig = {} as TangibleEntityConfig;
    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'visitors',
          oppositeName: 'favorites',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'curator',
          oppositeName: 'locations',
          config: personConfig,
          type: 'duplexFields',
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
          name: 'spouse',
          oppositeName: 'spouse',
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'locations',
          oppositeName: 'curator',
          config: placeConfig,
          array: true,
          type: 'duplexFields',
        },
        {
          name: 'favorites',
          oppositeName: 'visitors',
          config: placeConfig,
          array: true,
          type: 'duplexFields',
        },
      ],
    });
    const data = {
      _id: '111',
      firstName: 'Vasya',
      lastName: 'Pupkin',
      spouse: '222',
      location: '333',
      locations: ['444', '555'],
      favorites: ['666', '777'],
    };

    const expectedResult = new Map();
    expectedResult.set(personConfig, [
      {
        deleteOne: {
          filter: {
            _id: '111',
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '222',
          },
          update: {
            $unset: {
              spouse: 1,
            },
          },
        },
      },
    ]);

    expectedResult.set(placeConfig, [
      {
        updateOne: {
          filter: {
            _id: '333',
          },
          update: {
            $pull: {
              citizens: '111',
            },
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '444',
          },
          update: {
            $unset: {
              curator: 1,
            },
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '555',
          },
          update: {
            $unset: {
              curator: 1,
            },
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '666',
          },
          update: {
            $pull: {
              visitors: '111',
            },
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '777',
          },
          update: {
            $pull: {
              visitors: '111',
            },
          },
        },
      },
    ]);

    const toDelete = true;
    const result = processDeleteData(data, null, personConfig, toDelete);

    expect(result).toEqual(expectedResult);
  });
});
