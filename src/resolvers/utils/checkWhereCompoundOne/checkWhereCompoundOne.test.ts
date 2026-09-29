import type { EntityConfig } from '@/tsTypes';

import checkWhereCompoundOne from './index';

describe('checkWhereCompoundOne', () => {
  const entityConfig: EntityConfig = {
    name: 'City',
    type: 'tangible',

    uniqueCompoundIndexes: [
      ['name', 'country'],
      ['postcode', 'country'],
    ],

    textFields: [
      { name: 'name', type: 'textFields' },
      { name: 'postcode', type: 'textFields' },
    ],
  };

  test('should accept fields of the first index', () => {
    expect(() =>
      checkWhereCompoundOne({ name: 'Kyiv', country: '5f1a00000000000000000001' }, entityConfig),
    ).not.toThrow();
  });

  test('should accept fields of the second index in another order', () => {
    expect(() =>
      checkWhereCompoundOne(
        { country: '5f1a00000000000000000001', postcode: '01001' },
        entityConfig,
      ),
    ).not.toThrow();
  });

  test('should accept "null" value as a present field', () => {
    expect(() =>
      checkWhereCompoundOne({ name: 'Atlantis', country: null }, entityConfig),
    ).not.toThrow();
  });

  test('should reject not all fields of index', () => {
    expect(() => checkWhereCompoundOne({ name: 'Kyiv' }, entityConfig)).toThrow(TypeError);
  });

  test('should reject fields of two indexes', () => {
    expect(() =>
      checkWhereCompoundOne(
        { name: 'Kyiv', postcode: '01001', country: '5f1a00000000000000000001' },
        entityConfig,
      ),
    ).toThrow(TypeError);
  });

  test('should reject "_exists" key', () => {
    expect(() =>
      checkWhereCompoundOne({ name: 'Kyiv', country_exists: false }, entityConfig),
    ).toThrow(TypeError);
  });

  test('should reject entity without "uniqueCompoundIndexes"', () => {
    expect(() =>
      checkWhereCompoundOne({ name: 'Kyiv' }, { name: 'Country', type: 'tangible' }),
    ).toThrow(TypeError);
  });
});
