import type {
  ActionSignatureMethods,
  GeneralConfig,
  Inventory,
  SimplifiedTangibleEntityConfig,
} from '@/tsTypes';

import composeAllEntityConfigsAndEnums from '@/utils/composeAllEntityConfigs';
import composeGqlTypes from '@/types/composeGqlTypes';
import checkGeneralInventory from './checkGeneralInventory';

describe('checkGeneralInventory', () => {
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

    // only filter field refers to single "City"
    filterFields: [{ name: 'start', configName: 'City' }],
  };

  const allEntityConfigs = composeAllEntityConfigsAndEnums([
    countryConfig,
    cityConfig,
    routeConfig,
  ]);

  const recalculateCountry: ActionSignatureMethods = {
    name: 'recalculateEntity',
    specificName: ({ name }) => (name === 'Country' ? `recalculate${name}` : ''),
    argNames: () => ['whereOne'],
    argTypes: ({ name }) => [`${name}WhereOneInput!`],
    involvedEntityNames: ({ name }) => ({ inputOutputEntity: name }),
    type: ({ name }) => `${name}!`,
    config: (entityConfig) => entityConfig,
  };

  const custom = { Mutation: { recalculateEntity: recalculateCountry } };

  const representations = {
    ForCatalog: {
      representationKey: 'ForCatalog',
      allow: {
        Country: ['entities' as const, 'childEntity' as const],
        City: ['childEntities' as const],
      },
    },
  };

  const check = (inventory: Inventory) => () =>
    checkGeneralInventory({ allEntityConfigs, custom, representations, inventory });

  test('should accept correct inventory', () => {
    expect(
      check({
        name: 'G',
        include: {
          Query: {
            entity: ['Country'],
            entities: ['Country', 'City'],
            entitiesForCatalog: ['Country'],
            childEntity: ['Country'],
            childEntities: ['City'],
          },
          Mutation: { createEntity: true, recalculateEntity: ['Country'] },
          Subscription: true,
        },
        exclude: { Mutation: { createEntity: ['City'] } },
      }),
    ).not.toThrow();
  });

  test('should accept "true" and absent options', () => {
    expect(check({ name: 'G', include: true })).not.toThrow();
    expect(check({ name: 'G', exclude: true })).not.toThrow();
    expect(check({ name: 'G' })).not.toThrow();
    expect(() => checkGeneralInventory({ allEntityConfigs })).not.toThrow();
  });

  test('should accept child action of entity referred only by filter field', () => {
    expect(check({ name: 'G', include: { Query: { childEntity: ['City'] } } })).not.toThrow();
  });

  test('should reject generated action name with hint', () => {
    expect(check({ name: 'G', include: { Query: { Countries: true } } })).toThrow(
      'Incorrect action name: "Countries" in "Query" of inventory "G" (include)! "Countries" is a generated name, use general action name instead: { Query: { entities: ["Country"] } }!',
    );

    expect(check({ name: 'G', exclude: { Mutation: { recalculateCountry: true } } })).toThrow(
      'Incorrect action name: "recalculateCountry" in "Mutation" of inventory "G" (exclude)! "recalculateCountry" is a generated name, use general action name instead: { Mutation: { recalculateEntity: ["Country"] } }!',
    );

    expect(check({ name: 'G', include: { Query: { CountriesForCatalog: true } } })).toThrow(
      '{ Query: { entitiesForCatalog: ["Country"] } }',
    );
  });

  test('should reject entity name used as action name', () => {
    expect(check({ name: 'G', include: { Query: { Country: true } } })).toThrow(
      'Incorrect action name: "Country" in "Query" of inventory "G" (include)! "Country" is an entity name: use general action names (e.g. "entities") as keys and entity names in their arrays!',
    );
  });

  test('should reject unknown action name', () => {
    expect(check({ name: 'G', include: { Subscription: { createEntity: true } } })).toThrow(
      'Incorrect action name: "createEntity" in "Subscription" of inventory "G" (include)!',
    );
  });

  test('should reject unknown action type', () => {
    expect(check({ name: 'G', include: { Queries: { entities: true } } } as any)).toThrow(
      'Incorrect action type: "Queries" in inventory "G" (include): expected "Query", "Mutation" or "Subscription"!',
    );
  });

  test('should reject unknown key of inventory', () => {
    expect(check({ name: 'G', includes: { Query: true } } as any)).toThrow(
      'Incorrect key: "includes" of inventory "G": expected "name", "include" or "exclude"!',
    );
  });

  test('should reject unknown entity name', () => {
    expect(check({ name: 'G', include: { Query: { entities: ['Contry'] } } })).toThrow(
      'Incorrect entity name: "Contry" in "Query": "entities" of inventory "G" (include): entity not found!',
    );
  });

  test('should reject entity for which action is not available', () => {
    expect(check({ name: 'G', exclude: { Mutation: { recalculateEntity: ['City'] } } })).toThrow(
      'Incorrect entity name: "City" in "Mutation": "recalculateEntity" of inventory "G" (exclude): action is not available for the entity (available for: "Country")!',
    );
  });

  test('should reject incorrect shape', () => {
    expect(check({ name: 'G', include: { Query: { entities: 'Country' } } } as any)).toThrow(
      'Incorrect value of "Query": "entities" in inventory "G" (include): expected "true" or array of entity names!',
    );

    expect(check({ name: 'G', include: { Query: ['entities'] } } as any)).toThrow(
      'Incorrect value of "Query" in inventory "G" (include): expected "true" or object with action names as keys!',
    );
  });

  test('should be called by "composeGqlTypes"', () => {
    const generalConfig: GeneralConfig = {
      allEntityConfigs,
      inventory: { name: 'G', include: { Query: { Countries: true } } },
    };

    expect(() => composeGqlTypes(generalConfig)).toThrow(
      'Incorrect action name: "Countries" in "Query" of inventory "G" (include)!',
    );
  });
});
