// @flow
/* eslint-env jest */
import type { Periphery, ThingConfig } from '../../flowTypes';

const processUpdateInputData = require('./processUpdateInputData');

describe('processUpdateInputData', () => {
  test('should create object and children objectcs with duplex fields along with connect', () => {
    const personConfig: ThingConfig = {};
    const placeConfig: ThingConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
        },
        {
          name: 'visitors',
          oppositeName: 'favorites',
          array: true,
          config: personConfig,
        },
        {
          name: 'curator',
          oppositeName: 'locations',
          config: personConfig,
        },
      ],
    };
    Object.assign(personConfig, {
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
      duplexFields: [
        {
          name: 'friend',
          oppositeName: 'friend',
          config: personConfig,
          required: true,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
        },
        {
          name: 'locations',
          oppositeName: 'curator',
          config: placeConfig,
          array: true,
        },
        {
          name: 'favorites',
          oppositeName: 'visitors',
          config: placeConfig,
          array: true,
        },
      ],
    });
    const data = {
      _id: '999',
      firstName: 'Vasya',
      lastName: 'Pupkin',
      friend: '111',
      location: '222',
      locations: ['333', '444'],
      favorites: ['555', '666'],
    };

    const core = new Map();
    core.set(personConfig, [
      {
        updateOne: {
          filter: {
            _id: '111',
          },
          update: {
            friend: '999',
          },
        },
      },
    ]);
    core.set(placeConfig, [
      {
        updateOne: {
          filter: {
            _id: '222',
          },
          update: {
            $push: {
              citizens: '999',
            },
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '333',
          },
          update: {
            curator: '999',
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '444',
          },
          update: {
            curator: '999',
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '555',
          },
          update: {
            $push: {
              visitors: '999',
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
            $push: {
              visitors: '999',
            },
          },
        },
      },
    ]);
    const periphery: Periphery = new Map();
    periphery.set(personConfig, {
      friend: {
        oppositeIds: ['111'],
        array: false,
        name: 'friend',
        oppositeConfig: personConfig,
      },
    });
    periphery.set(placeConfig, {
      curator: {
        oppositeIds: ['333', '444'],
        array: true,
        name: 'locations',
        oppositeConfig: personConfig,
      },
    });

    const expectedResult = {
      core,
      periphery,
    };

    const result = processUpdateInputData(data, personConfig);

    expect(result).toEqual(expectedResult);
  });
});
