/* eslint-env jest */

import categorizeBulkOperations from './categorizeBulkOperations';

describe('categorizeBulkOperations', () => {
  test('should return correct result', () => {
    const preparedBulk = [
      {
        updateOne: {
          // 0
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
          // 1
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
          // 2
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
          // 4
          filter: {
            _id: '13',
          },
        },
      },
    ];

    const expectedResult = {
      insertOne: { '15': 1 },
      deleteOne: { '13': 4 },
    };
    const result = categorizeBulkOperations(preparedBulk);

    expect(result).toEqual(expectedResult);
  });
});
