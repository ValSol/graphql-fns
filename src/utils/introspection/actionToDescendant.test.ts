/* eslint-env jest */
import type {
  ActionSignatureMethods,
  DescendantAttributes,
  TangibleEntityConfig,
} from '../../tsTypes';
import type { ActionToParse, ParsedAction } from './tsTypes';

import composeDescendantConfigByName from '../composeDescendantConfigByName';
import actionToDescendant from './actionToDescendant';

describe('actionToDescendant', () => {
  const placeConfig = {} as TangibleEntityConfig;
  const personConfig = {} as TangibleEntityConfig;

  const countryConfig: TangibleEntityConfig = {
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
        array: true,
        config: placeConfig,
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
        array: true,
        config: personConfig,
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
        config: personConfig,
        parent: true,
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

    descendantFields: {
      Person: {
        friends: 'ForCatalog',
        place: 'ForCatalog',
        parent: 'ForCatalog',
        children: 'ForCatalog',
      },
      Place: {
        country: 'ForCatalog',
      },
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

  test('have to return descendantAttributes with Person: [entitiesByUnique]', () => {
    const actionToParse: ActionToParse = {
      actionType: 'Query',
      actionName: 'thingsByUniqueForCatalog',
      entityName: 'Person',
    };

    const parsedAction: ParsedAction = {
      creationType: 'descendant',
      entityConfig: composeDescendantConfigByName('ForCatalog', personConfig, generalConfig),
      baseAction: 'entitiesByUnique',
      descendantKey: 'ForCatalog',
    };

    const descendantAttributes: { [descendantKey: string]: DescendantAttributes } = {};

    const expectedResult = {
      ForCatalog: {
        descendantKey: 'ForCatalog',
        allow: {
          Person: ['entitiesByUnique'],
        },
      },
    };

    const result = actionToDescendant(
      actionToParse,
      parsedAction,
      descendantAttributes,
      generalConfig,
    );

    expect(result).toEqual(expectedResult);
  });

  test('have to return descendantAttributes with Person: [entities]', () => {
    const actionToParse: ActionToParse = {
      actionType: 'Query',
      actionName: 'entitiesForCatalog',
      entityName: 'Person',
    };

    const parsedAction: ParsedAction = {
      creationType: 'descendant',
      entityConfig: composeDescendantConfigByName('ForCatalog', personConfig, generalConfig),
      baseAction: 'entities',
      descendantKey: 'ForCatalog',
    };

    const descendantAttributes: { [descendantKey: string]: DescendantAttributes } = {
      ForCatalog: {
        descendantKey: 'ForCatalog',
        allow: {
          Person: ['entitiesByUnique'],
        },
      },
    };

    const expectedResult = {
      ForCatalog: {
        descendantKey: 'ForCatalog',
        allow: {
          Person: ['entitiesByUnique', 'entities'],
        },
      },
    };

    const result = actionToDescendant(
      actionToParse,
      parsedAction,
      descendantAttributes,
      generalConfig,
    );

    expect(result).toEqual(expectedResult);
  });
});
