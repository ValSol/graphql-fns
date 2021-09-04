// @flow
/* eslint-env jest */
import type { ThingConfig, ClientOptions } from '../../flowTypes';

import getChildQueries from './getChildQueries';

describe('getChildQueries', () => {
  const countryConfig: ThingConfig = {
    name: 'Country',
    textFields: [
      {
        name: 'title',
      },
    ],
  };
  const placeConfig: ThingConfig = {
    name: 'Place',
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
  const personConfig: ThingConfig = {};
  Object.assign(personConfig, {
    name: 'Person',
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
    thingConfigs: { Person: personConfig, Place: placeConfig, Country: countryConfig },
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
          actionName: 'childThings',
          baseAction: 'childThings',
          suffix: '',
          thingName: 'Person',
        },
        {
          actionName: 'childThing',
          baseAction: 'childThing',
          suffix: '',
          thingName: 'Person',
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
          actionName: 'childThings',
          baseAction: 'childThings',
          suffix: '',
          thingName: 'Person',
        },
        {
          actionName: 'childThing',
          baseAction: 'childThing',
          suffix: '',
          thingName: 'Place',
        },
        {
          actionName: 'childThing',
          baseAction: 'childThing',
          suffix: '',
          thingName: 'Person',
        },
        {
          actionName: 'childThing',
          baseAction: 'childThing',
          suffix: '',
          thingName: 'Country',
        },
      ],
      maxShift: 1,
    };

    const result = getChildQueries(personConfig, generalConfig, options);
    expect(result).toEqual(expectedResult);
  });
});
