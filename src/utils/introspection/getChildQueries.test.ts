/* eslint-env jest */
import type { EntityConfig, ClientOptions, TangibleEntityConfig } from '../../tsTypes';

import getChildQueries from './getChildQueries';

describe('getChildQueries', () => {
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
        name: 'citizens',
        oppositeName: 'place',
        config: personConfig,
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
        config: personConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
      {
        name: 'place',
        oppositeName: 'citizens',
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

  const generalConfig = {
    allEntityConfigs: { Person: personConfig, Place: placeConfig, Country: countryConfig },
  };

  test('should compose relatioanl and duplex fields with depth: 0 & include option 1', () => {
    const include = {
      id: true,
      friends: true,
      parent: true,
    };
    const options: ClientOptions = { include };
    const expectedResult = {
      childQueries: [
        {
          actionName: 'childEntities',
          baseAction: 'childEntities',
          descendantKey: '',
          entityName: 'Person',
        },
        {
          actionName: 'childEntity',
          baseAction: 'childEntity',
          descendantKey: '',
          entityName: 'Person',
        },
      ],
      maxShift: 0,
    };

    const result = getChildQueries(personConfig, generalConfig, options);
    expect(result).toEqual(expectedResult);
  });

  test('should compose relatioanl and duplex fields with all fields', () => {
    const options: ClientOptions = { depth: 1 };
    const expectedResult = {
      childQueries: [
        {
          actionName: 'childEntities',
          baseAction: 'childEntities',
          descendantKey: '',
          entityName: 'Person',
        },
        {
          actionName: 'childEntity',
          baseAction: 'childEntity',
          descendantKey: '',
          entityName: 'Place',
        },
        {
          actionName: 'childEntity',
          baseAction: 'childEntity',
          descendantKey: '',
          entityName: 'Person',
        },
        {
          actionName: 'childEntity',
          baseAction: 'childEntity',
          descendantKey: '',
          entityName: 'Country',
        },
      ],
      maxShift: 1,
    };

    const result = getChildQueries(personConfig, generalConfig, options);
    expect(result).toEqual(expectedResult);
  });
});
