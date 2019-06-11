// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const clearUpdateInputDate = require('./clearUpdateInputDate');

describe('clearUpdateInputDate', () => {
  test('should remove connect', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexField',
        },
      ],
    });

    const data = {
      relationalField: { connect: '5cefb33f05d6be4b7b59842b' },
      duplexField: { connect: '5cefb33f05d6be4b7b59842c' },
    };

    const expectedResult = {
      relationalField: '5cefb33f05d6be4b7b59842b',
      duplexField: '5cefb33f05d6be4b7b59842c',
    };

    const result = clearUpdateInputDate(data, thingConfig);

    expect(result).toEqual(expectedResult);
  });
});
