import type { TangibleEntityConfig } from '@/tsTypes';

import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeRelationalKey from './composeRelationalKey';

describe('composeRelationalKey', () => {
  const allEntityConfigs = composeAllEntityConfigs([
    { name: 'Currency', textFields: [{ name: 'code', index: true }] },
    {
      name: 'Country',
      textFields: [{ name: 'name', index: true }],
      relationalFields: [
        { name: 'currency', configName: 'Currency', oppositeName: 'countries', index: true },
      ],
    },
    {
      name: 'City',
      textFields: [{ name: 'name', index: true }],
      relationalFields: [
        { name: 'country', configName: 'Country', oppositeName: 'cities', index: true },
      ],
    },
  ]);

  const City = allEntityConfigs.City as TangibleEntityConfig;
  const Country = allEntityConfigs.Country as TangibleEntityConfig;

  test('should register the lookup of one level', () => {
    const lookupArray: string[] = [];

    const { relationalKey, entityConfig } = composeRelationalKey('country_', '', lookupArray, City);

    expect(relationalKey).toBe('country_');
    expect(entityConfig.name).toBe('Country');
    expect(lookupArray).toEqual([':country_:Country']);
  });

  test('should continue the key of the parent level', () => {
    const lookupArray = [':country_:Country'];

    const { relationalKey, entityConfig } = composeRelationalKey(
      'currency_',
      'country_',
      lookupArray,
      Country,
    );

    expect(relationalKey).toBe('country_currency_');
    expect(entityConfig.name).toBe('Currency');
    expect(lookupArray).toEqual([':country_:Country', 'country_:currency_:Currency']);
  });

  test('should register the opposite side of a relational link with its opposite name', () => {
    const lookupArray: string[] = [];

    const { relationalKey, entityConfig } = composeRelationalKey(
      'cities_',
      '',
      lookupArray,
      Country,
    );

    expect(relationalKey).toBe('cities_');
    expect(entityConfig.name).toBe('City');
    expect(lookupArray).toEqual([':cities_:City:country']);
  });

  test('should register a lookup once', () => {
    const lookupArray: string[] = [];

    composeRelationalKey('country_', '', lookupArray, City);
    composeRelationalKey('country_', '', lookupArray, City);

    expect(lookupArray).toEqual([':country_:Country']);
  });

  test('should throw for a field that is not a link', () => {
    expect(() => composeRelationalKey('name_', '', [], City)).toThrow(
      'Field "name" must has attr "config"!',
    );
  });
});
