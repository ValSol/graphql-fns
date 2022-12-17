// @flow
/* eslint-env jest */
import type { EntityConfig, ClientOptions } from '../../flowTypes';

import getChildQueries from './getChildQueries';

describe('getChildQueries', () => {
  const countryConfig: EntityConfig = {
    name: 'Country',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
      },
    ],
  };
  const placeConfig: EntityConfig = {
    name: 'Place',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
      },
    ],
    relationalFields: [
      {
        name: 'country',
        config: countryConfig,
      },
    ],
  };
  const personConfig: EntityConfig = {};
  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [
      {
        name: 'firstName',
      },
      {
        name: 'secondName',
      },
    ],
    relationalFields: [
      {
        name: 'friends',
        array: true,
        config: personConfig,
      },
      {
        name: 'place',
        config: placeConfig,
      },
    ],
    duplexFields: [
      {
        name: 'parent',
        config: personConfig,
        oppositeName: 'children',
      },
      {
        name: 'children',
        array: true,
        config: personConfig,
        oppositeName: 'parent',
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
          derivativeKey: '',
          entityName: 'Person',
        },
        {
          actionName: 'childEntity',
          baseAction: 'childEntity',
          derivativeKey: '',
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
          derivativeKey: '',
          entityName: 'Person',
        },
        {
          actionName: 'childEntity',
          baseAction: 'childEntity',
          derivativeKey: '',
          entityName: 'Place',
        },
        {
          actionName: 'childEntity',
          baseAction: 'childEntity',
          derivativeKey: '',
          entityName: 'Person',
        },
        {
          actionName: 'childEntity',
          baseAction: 'childEntity',
          derivativeKey: '',
          entityName: 'Country',
        },
      ],
      maxShift: 1,
    };

    const result = getChildQueries(personConfig, generalConfig, options);
    expect(result).toEqual(expectedResult);
  });
});
