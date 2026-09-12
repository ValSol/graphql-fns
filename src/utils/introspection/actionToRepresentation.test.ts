/* eslint-env jest */
import type {
  ActionSignatureMethods,
  RepresentationAttributes,
  TangibleEntityConfig,
} from '../../tsTypes';
import type { ActionToParse, ParsedAction } from './tsTypes';

import composeRepresentationConfigByName from '../composeRepresentationConfigByName';
import actionToRepresentation from './actionToRepresentation';

describe('actionToRepresentation', () => {
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

  const ForCatalog: RepresentationAttributes = {
    representationKey: 'ForCatalog',
    allow: {
      Person: ['entitiesByUnique', 'childEntities', 'childEntity'],
      Place: ['childEntity', 'childEntities'],
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
  const representation = { ForCatalog };

  const generalConfig = { allEntityConfigs, custom, representation };

  test('have to return representationAttributes with Person: [entitiesByUnique]', () => {
    const actionToParse: ActionToParse = {
      actionType: 'Query',
      actionName: 'thingsByUniqueForCatalog',
      entityName: 'Person',
    };

    const parsedAction: ParsedAction = {
      creationType: 'representation',
      entityConfig: composeRepresentationConfigByName('ForCatalog', personConfig, generalConfig),
      baseAction: 'entitiesByUnique',
      representationKey: 'ForCatalog',
    };

    const representationAttributes: { [representationKey: string]: RepresentationAttributes } = {};

    const expectedResult = {
      ForCatalog: {
        representationKey: 'ForCatalog',
        allow: {
          Person: ['entitiesByUnique'],
        },
      },
    };

    const result = actionToRepresentation(
      actionToParse,
      parsedAction,
      representationAttributes,
      generalConfig,
    );

    expect(result).toEqual(expectedResult);
  });

  test('have to return representationAttributes with Person: [entities]', () => {
    const actionToParse: ActionToParse = {
      actionType: 'Query',
      actionName: 'entitiesForCatalog',
      entityName: 'Person',
    };

    const parsedAction: ParsedAction = {
      creationType: 'representation',
      entityConfig: composeRepresentationConfigByName('ForCatalog', personConfig, generalConfig),
      baseAction: 'entities',
      representationKey: 'ForCatalog',
    };

    const representationAttributes: { [representationKey: string]: RepresentationAttributes } = {
      ForCatalog: {
        representationKey: 'ForCatalog',
        allow: {
          Person: ['entitiesByUnique'],
        },
      },
    };

    const expectedResult = {
      ForCatalog: {
        representationKey: 'ForCatalog',
        allow: {
          Person: ['entitiesByUnique', 'entities'],
        },
      },
    };

    const result = actionToRepresentation(
      actionToParse,
      parsedAction,
      representationAttributes,
      generalConfig,
    );

    expect(result).toEqual(expectedResult);
  });
});
