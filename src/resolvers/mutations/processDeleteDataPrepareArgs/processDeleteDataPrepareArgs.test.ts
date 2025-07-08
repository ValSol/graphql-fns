/* eslint-env jest */

import type { GraphqlObject, TangibleEntityConfig } from '../../../tsTypes';

import processDeleteDataPrepareArgs from '.';

describe('processDeleteDataPrepareArgs', () => {
  const personConfig = {} as TangibleEntityConfig;
  const placeConfig: TangibleEntityConfig = {
    name: 'Place',
    type: 'tangible',
    textFields: [{ name: 'name', unique: true, type: 'textFields' }],
    duplexFields: [
      {
        name: 'citizens',
        oppositeName: 'location',
        array: true,
        config: personConfig,
        type: 'duplexFields',
      },
      {
        name: 'visitors',
        oppositeName: 'favorities',
        array: true,
        config: personConfig,
        type: 'duplexFields',
      },
      {
        name: 'curator',
        oppositeName: 'locations',
        config: personConfig,
        type: 'duplexFields',
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
        type: 'textFields',
      },
      {
        name: 'lastName',
        required: true,
        type: 'textFields',
      },
    ],
    relationalFields: [
      {
        name: 'sibling',
        oppositeName: 'parentSiblings',
        config: personConfig,
        required: true,
        type: 'relationalFields',
      },
      {
        name: 'parentSiblings',
        oppositeName: 'sibling',
        config: personConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
    ],
    duplexFields: [
      {
        name: 'friend',
        oppositeName: 'friend',
        config: personConfig,
        required: true,
        type: 'duplexFields',
      },
      {
        name: 'location',
        oppositeName: 'citizens',
        config: placeConfig,
        required: true,
        type: 'duplexFields',
      },
      {
        name: 'locations',
        oppositeName: 'curator',
        config: placeConfig,
        array: true,
        type: 'duplexFields',
      },
      {
        name: 'favorities',
        oppositeName: 'visitors',
        config: placeConfig,
        array: true,
        type: 'duplexFields',
      },
    ],
  });

  const previousEntity = {
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
    const data: GraphqlObject = {
      firstName: 'Mark 3',
    };

    const result = processDeleteDataPrepareArgs(data, previousEntity, personConfig);

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

    const result = processDeleteDataPrepareArgs(data, previousEntity, personConfig);

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

    const result = processDeleteDataPrepareArgs(data, previousEntity, personConfig);

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
