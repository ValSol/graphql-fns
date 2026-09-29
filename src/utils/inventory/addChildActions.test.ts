import type { GeneralConfig, Inventory, SimplifiedTangibleEntityConfig } from '@/tsTypes';

import composeAllEntityConfigsAndEnums from '@/utils/composeAllEntityConfigs';
import composeGqlTypes from '@/types/composeGqlTypes';
import addChildActions from './addChildActions';

describe('addChildActions', () => {
  const countryConfig: SimplifiedTangibleEntityConfig = {
    name: 'Country',
    type: 'tangible',

    textFields: [{ name: 'code', unique: true }],

    duplexFields: [
      { name: 'cities', oppositeName: 'country', array: true, configName: 'City', parent: true },
    ],
  };

  const cityConfig: SimplifiedTangibleEntityConfig = {
    name: 'City',
    type: 'tangible',

    textFields: [{ name: 'name', index: true }],

    duplexFields: [{ name: 'country', oppositeName: 'cities', configName: 'Country' }],
  };

  const routeConfig: SimplifiedTangibleEntityConfig = {
    name: 'Route',
    type: 'tangible',

    textFields: [{ name: 'name' }],

    filterFields: [{ name: 'start', configName: 'City' }],
  };

  const allEntityConfigs = composeAllEntityConfigsAndEnums([
    countryConfig,
    cityConfig,
    routeConfig,
  ]);

  const generalConfig: GeneralConfig = { allEntityConfigs };

  test('should add child queries of entities with included root queries', () => {
    const inventory: Inventory = {
      name: 'G',
      include: {
        Query: { entity: ['Country', 'City'], entities: ['Country', 'City'] },
        Mutation: { createEntity: true },
      },
      exclude: { Query: { entity: ['City'] } },
    };

    const result = addChildActions(inventory, generalConfig);

    expect(result).toEqual({
      name: 'G',
      include: {
        Query: {
          entity: ['Country', 'City'],
          entities: ['Country', 'City'],
          childEntity: ['Country', 'City'], // "City.country" & "Route.start"
          childEntities: ['City'], // "Country.cities"
        },
        Mutation: { createEntity: true },
      },
      exclude: { Query: { entity: ['City'] } },
    });

    // the argument is not changed
    expect(inventory.include).toEqual({
      Query: { entity: ['Country', 'City'], entities: ['Country', 'City'] },
      Mutation: { createEntity: true },
    });
  });

  test('should unwind "true" and keep already listed child queries', () => {
    const inventory: Inventory = {
      name: 'G',
      include: {
        Query: {
          entities: true,
          entityCount: ['City'],
          childEntities: ['City'],
          childEntity: true,
        },
      },
    };

    expect(addChildActions(inventory, generalConfig).include).toEqual({
      Query: {
        entities: true,
        entityCount: ['City'],
        childEntities: ['City'],
        childEntity: true,
        childEntityCount: ['City'],
      },
    });
  });

  test('should return inventory as is if every query is allowed', () => {
    const inventories: Inventory[] = [
      { name: 'G' },
      { name: 'G', include: true },
      { name: 'G', include: { Query: true } },
      { name: 'G', include: { Mutation: true } },
    ];

    inventories.forEach((inventory) => {
      expect(addChildActions(inventory, generalConfig)).toBe(inventory);
    });
  });

  test('should add child queries of representations', () => {
    const representations = {
      ForCatalog: {
        representationKey: 'ForCatalog',
        allow: {
          Country: ['entities' as const, 'childEntity' as const],
          City: ['entities' as const, 'childEntities' as const],
        },
      },
    };

    const inventory: Inventory = {
      name: 'G',
      include: { Query: { entitiesForCatalog: ['City'] } },
    };

    expect(addChildActions(inventory, { allEntityConfigs, representations }).include).toEqual({
      Query: { entitiesForCatalog: ['City'], childEntitiesForCatalog: ['City'] },
    });
  });

  test('should validate inventory', () => {
    expect(() =>
      addChildActions({ name: 'G', include: { Query: { Countries: true } } }, generalConfig),
    ).toThrow('Incorrect action name: "Countries" in "Query" of inventory "G" (include)!');
  });

  test('should return relation fields to the schema', () => {
    const inventory: Inventory = {
      name: 'G',
      include: { Query: { entity: ['Country', 'City'], entities: ['Country', 'City'] } },
    };

    const withoutChildren = composeGqlTypes({ allEntityConfigs, inventory }).typeDefs;

    expect(withoutChildren).not.toMatch(/^ {2}cities\b/m);
    expect(withoutChildren).not.toMatch(/^ {2}country\b/m);

    const withChildren = composeGqlTypes({
      allEntityConfigs,
      inventory: addChildActions(inventory, generalConfig),
    }).typeDefs;

    expect(withChildren).toMatch(/^ {2}cities\(.*\): \[City!\]!$/m);
    expect(withChildren).toMatch(/^ {2}country: Country$/m);
  });
});
