// @flow
/* eslint-env jest */

import optimizeBulk from './index';

describe('optimizeBulk', () => {
  test('should return correct result 1', () => {
    const preparedBulk = [
      {
        updateOne: {
          filter: {
            _id: '13',
          },
          update: {
            $push: {
              citizens: '15',
            },
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '111',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        updateOne: {
          // 3
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        deleteOne: {
          filter: {
            _id: '13',
          },
        },
      },
    ];

    const expectedResult = [
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '111',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        updateOne: {
          // 3
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        deleteMany: {
          filter: {
            _id: { $in: ['13'] },
          },
        },
      },
    ];

    const result = optimizeBulk(preparedBulk);

    expect(result).toEqual(expectedResult);
  });

  test('should return correct result 2', () => {
    const preparedBulk = [
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            $push: {
              citizens: '15',
            },
          },
        },
      },
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '111',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        updateOne: {
          // 3
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        deleteOne: {
          filter: {
            _id: '13',
          },
        },
      },
    ];

    const expectedResult = [
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '111',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        updateOne: {
          // 3
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        deleteMany: {
          filter: {
            _id: { $in: ['13'] },
          },
        },
      },
    ];

    const result = optimizeBulk(preparedBulk);

    expect(result).toEqual(expectedResult);
  });

  test('should return correct result 3', () => {
    const preparedBulk = [
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            $push: {
              citizens: '15',
            },
          },
        },
      },
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '111',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '121',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '112',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '17',
          },
        },
      },
    ];

    const expectedResult = [
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '112',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '17',
          },
        },
      },
    ];
    const result = optimizeBulk(preparedBulk);

    expect(result).toEqual(expectedResult);
  });

  test('should return correct result 4', () => {
    const preparedBulk = [
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            $push: {
              citizens: '15',
            },
          },
        },
      },
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '111',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '121',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '112',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '17',
          },
        },
      },
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
    ];

    const expectedResult = [
      {
        deleteMany: {
          filter: {
            _id: { $in: ['15'] },
          },
        },
      },
    ];
    const result = optimizeBulk(preparedBulk);

    expect(result).toEqual(expectedResult);
  });

  test('should return correct result 3', () => {
    const preparedBulk = [
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            $push: {
              citizens: '15',
            },
          },
        },
      },
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '111',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '121',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '15',
          },
        },
      },
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '112',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '17',
          },
        },
      },
    ];

    const expectedResult = [
      {
        deleteOne: {
          filter: {
            _id: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '112',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '15',
          },
          update: {
            curator: '17',
          },
        },
      },
    ];
    const result = optimizeBulk(preparedBulk);

    expect(result).toEqual(expectedResult);
  });

  test('should return correct result 4', () => {
    const preparedBulk = [
      { deleteOne: { filter: { _id: '609d05779fd083e759449afb' } } },
      {
        updateOne: {
          filter: { _id: '609d05779fd083e759449afb' },
          update: { $pull: { children: '609d05779fd083e759449afc' } },
        },
      },
      {
        updateOne: {
          filter: { _id: '609d05779fd083e759449afb' },
          update: { $pull: { children: '609d05779fd083e759449afd' } },
        },
      },
      {
        updateOne: {
          filter: { _id: '609d05779fd083e759449afb' },
          update: { $pull: { children: '609d05779fd083e759449afe' } },
        },
      },
    ];

    const expectedResult = [
      { deleteMany: { filter: { _id: { $in: ['609d05779fd083e759449afb'] } } } },
    ];
    const result = optimizeBulk(preparedBulk);

    expect(result).toEqual(expectedResult);
  });
});
