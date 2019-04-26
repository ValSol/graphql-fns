// @flow
/* eslint-env jest */
const transformCreateIntoUpdateInput = require('./transformCreateIntoUpdateInput');

describe('transformCreateIntoUpdateInput', () => {
  test('transofrm update data into create data', () => {
    const personConfig = {
      name: 'Person',
      textFields: [],
      duplexFields: [],
    };
    const placeConfig = {
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
          name: 'spouse',
          oppositeName: 'spouse',
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

    const result = transformCreateIntoUpdateInput(data, personConfig);

    expect(result).toEqual(expectedResult);
  });
});
