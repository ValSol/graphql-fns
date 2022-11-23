// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../../flowTypes';

import processDeleteDataPrepareArgs from './index';

describe('processDeleteDataPrepareArgs', () => {
  const personConfig: ThingConfig = {};
  const placeConfig: ThingConfig = {
    name: 'Place',
    type: 'tangible',
    textFields: [{ name: 'name', unique: true }],
    duplexFields: [
      {
        name: 'citizens',
        oppositeName: 'location',
        array: true,
        config: personConfig,
      },
      {
        name: 'visitors',
        oppositeName: 'favorities',
        array: true,
        config: personConfig,
      },
      {
        name: 'curator',
        oppositeName: 'locations',
        config: personConfig,
      },
    ],
  };
  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [
      {
        name: 'firstName',
        required: true,
      },
      {
        name: 'lastName',
        required: true,
      },
    ],
    relationalFields: [
      {
        name: 'sibling',
        config: personConfig,
        required: true,
      },
    ],
    duplexFields: [
      {
        name: 'friend',
        oppositeName: 'friend',
        config: personConfig,
        required: true,
      },
      {
        name: 'location',
        oppositeName: 'citizens',
        config: placeConfig,
        required: true,
      },
      {
        name: 'locations',
        oppositeName: 'curator',
        config: placeConfig,
        array: true,
      },
      {
        name: 'favorities',
        oppositeName: 'visitors',
        config: placeConfig,
        array: true,
      },
    ],
  });

  const previousThing = {
    _id: '5f78230b9f0ecbeb5135b532',
    locations: [
      '5f78230b9f0ecbeb5135b537',
      '5f78230b9f0ecbeb5135b538',
      '5f78230b9f0ecbeb5135b539',
      '5f78230b9f0ecbeb5135b53a',
    ],
    favorities: [
      '5f78230b9f0ecbeb5135b53b',
      '5f78230b9f0ecbeb5135b53c',
      '5f78230b9f0ecbeb5135b53d',
      '5f78230b9f0ecbeb5135b53e',
    ],
    firstName: 'Mark 2',
    lastName: 'Tven 2',
    createdAt: '2020-10-03T07:06:51.578Z',
    updatedAt: '2020-10-03T07:06:51.619Z',
    __v: 0,
    friend: '5f78230b9f0ecbeb5135b535',
    location: '5f78230b9f0ecbeb5135b536',
    sibling: '5f78230b9f0ecbeb5135b534',
  };

  test('should return wrapped object without duplex fields', () => {
    const data = {
      firstName: 'Mark 3',
    };

    const result = processDeleteDataPrepareArgs(data, previousThing, personConfig);

    const expectedResult = {
      _id: '5f78230b9f0ecbeb5135b532',
      locations: [],
      favorities: [],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return wrapped object with scalar duplex field', () => {
    const data = {
      firstName: 'Mark 3',
      friend: { connect: null },
    };

    const result = processDeleteDataPrepareArgs(data, previousThing, personConfig);

    const expectedResult = {
      _id: '5f78230b9f0ecbeb5135b532',
      locations: [],
      favorities: [],
      friend: '5f78230b9f0ecbeb5135b535',
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return wrapped object with array duplex field', () => {
    const data = {
      locations: { connect: [] },
      friend: { connect: null },
    };

    const result = processDeleteDataPrepareArgs(data, previousThing, personConfig);

    const expectedResult = {
      _id: '5f78230b9f0ecbeb5135b532',
      locations: [
        '5f78230b9f0ecbeb5135b537',
        '5f78230b9f0ecbeb5135b538',
        '5f78230b9f0ecbeb5135b539',
        '5f78230b9f0ecbeb5135b53a',
      ],
      favorities: [],
      friend: '5f78230b9f0ecbeb5135b535',
    };

    expect(result).toEqual(expectedResult);
  });
});
