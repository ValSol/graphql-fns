/* eslint-env jest */
import type {
  ActionSignatureMethods,
  DescendantAttributes,
  EntityConfig,
  TangibleEntityConfig,
} from '../../tsTypes';

import parseChildQueries from './parseChildQueries';

describe('parseChildQueries', () => {
  const placeConfig = {} as TangibleEntityConfig;
  const personConfig = {} as EntityConfig;
  const countryConfig: EntityConfig = {
    name: 'Country',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        type: 'textFields',
      },
    ],
    relationalFields: [
      {
        name: 'places',
        oppositeName: 'country',
        config: placeConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
    ],
  };
  Object.assign(placeConfig, {
    name: 'Place',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        type: 'textFields',
      },
    ],
    relationalFields: [
      {
        name: 'country',
        oppositeName: 'places',
        config: countryConfig,
        type: 'relationalFields',
      },
      {
        name: 'citisens',
        oppositeName: 'place',
        config: placeConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
    ],
  });

  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [
      {
        name: 'firstName',
        type: 'textFields',
      },
      {
        name: 'secondName',
        type: 'textFields',
      },
    ],
    relationalFields: [
      {
        name: 'friends',
        oppositeName: 'fellows',
        array: true,
        config: personConfig,
        type: 'relationalFields',
      },
      {
        name: 'fellows',
        oppositeName: 'friends',
        array: true,
        parent: true,
        config: personConfig,
        type: 'relationalFields',
      },
      {
        name: 'place',
        oppositeName: 'citisens',
        config: placeConfig,
        type: 'relationalFields',
      },
    ],
    duplexFields: [
      {
        name: 'parent',
        config: personConfig,
        oppositeName: 'children',
        type: 'duplexFields',
      },
      {
        name: 'children',
        array: true,
        config: personConfig,
        oppositeName: 'parent',
        type: 'duplexFields',
      },
    ],
  });

  const signatureMethods: ActionSignatureMethods = {
    name: 'getEntity',
    specificName: ({ name }: any) => `get${name}`,
    argNames: () => [],
    argTypes: () => [],
    involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
    type: ({ name }: any) => `${name}!`,
    config: (entityConfig: any) => entityConfig,
  };

  const ForCatalog: DescendantAttributes = {
    descendantKey: 'ForCatalog',
    allow: {
      Person: ['entitiesByUnique', 'childEntities', 'childEntity'],
      Place: ['childEntity'],
      Country: ['childEntity'],
    },
  };

  const allEntityConfigs = {
    Person: personConfig,
    Place: placeConfig,
    Country: countryConfig,
  };
  const queryName = 'getEntity';
  const custom = { Query: { [queryName]: signatureMethods } };
  const descendant = { ForCatalog };

  const generalConfig = { allEntityConfigs, custom, descendant };

  test('have to return inventoryByRoles with  entitiesByUnique: [Person]', () => {
    const childQueries = ['childEntities:PersonForCatalog', 'childEntity:PlaceForCatalog'];

    const expectedResult = [
      {
        actionName: 'childEntitiesForCatalog',
        baseAction: 'childEntities',
        descendantKey: 'ForCatalog',
        entityName: 'Person',
      },
      {
        actionName: 'childEntityForCatalog',
        baseAction: 'childEntity',
        descendantKey: 'ForCatalog',
        entityName: 'Place',
      },
    ];

    const result = parseChildQueries(childQueries, generalConfig);

    expect(result).toEqual(expectedResult);
  });
});
