import type { EntityConfig } from '../../../../tsTypes';

import toGlobalId from '../../toGlobalId';
import transformWhereAndSearch from './transformWhereAndSearch';

describe('transformWhereAndSearch', () => {
  const personConfig = {} as EntityConfig;

  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [
      {
        name: 'firstName',
        weight: 1,
        type: 'textFields',
      },
    ],
    duplexFields: [
      {
        name: 'friends',
        oppositeName: 'friends',
        config: personConfig,
        array: true,
        index: true,
        type: 'duplexFields',
      },
    ],
  });

  const id1 = '5cefb33f05d6be4b7b59842a';
  const id2 = '5cefb33f05d6be4b7b59842b';

  test('should transform "where" of every item and keep "search"', () => {
    const whereAndSearch = [
      { where: { id_in: [toGlobalId(id1, 'Person')] }, search: 'Hugo' },
      { where: { friends: toGlobalId(id2, 'Person') } },
      { search: 'Adam' },
      {},
    ];

    const expectedResult = [
      { where: { id_in: [id1] }, search: 'Hugo' },
      { where: { friends: id2 } },
      { search: 'Adam' },
      {},
    ];

    const result = transformWhereAndSearch(whereAndSearch, personConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should transform single item', () => {
    const whereAndSearch = { where: { id: toGlobalId(id1, 'Person') }, search: 'Hugo' };

    const expectedResult = { where: { id: id1 }, search: 'Hugo' };

    const result = transformWhereAndSearch(whereAndSearch, personConfig);

    expect(result).toEqual(expectedResult);
  });
});
