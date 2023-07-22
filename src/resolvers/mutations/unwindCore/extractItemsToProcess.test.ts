/* eslint-env jest */
import type { TangibleEntityConfig } from '../../../tsTypes';

import extractItemsToProcess from './extractItemsToProcess';

describe('extractItemsToProcess', () => {
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
          required: true,
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

    const core = new Map();
    core.set(personConfig, [
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
      {
        insertOne: {
          document: {
            _id: '9999',
            firstName: 'Vasya',
            lastName: 'Pupkin',
          },
        },
      },
    ]);

    const placeBulkItems = [
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
    ];

    core.set(placeConfig, placeBulkItems);

    const result = extractItemsToProcess(core);

    const expectedResult = [[placeBulkItems, 3, placeConfig]];

    expect(result).toEqual(expectedResult);
  });
});
