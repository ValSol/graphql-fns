// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import clearUpdateInputData from './clearUpdateInputData';

describe('clearUpdateInputData', () => {
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

    const result = clearUpdateInputData(data, thingConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should return embedded array', () => {
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      textFields: [
        {
          name: 'embeddedTextField',
        },
      ],
    };

    const exampleConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedFields',
          config: embeddedConfig,
          array: true,
        },
      ],
    };

    const data = {
      textField: 'text Field',
      embeddedFields: [
        {
          embeddedTextField: 'embedded Text Field 1',
        },
        {
          embeddedTextField: 'embedded Text Field 2',
        },
      ],
    };

    const expectedResult = {
      textField: 'text Field',
      embeddedFields: [
        {
          embeddedTextField: 'embedded Text Field 1',
        },
        {
          embeddedTextField: 'embedded Text Field 2',
        },
      ],
    };

    const result = clearUpdateInputData(data, exampleConfig);

    expect(result).toEqual(expectedResult);
  });
});
