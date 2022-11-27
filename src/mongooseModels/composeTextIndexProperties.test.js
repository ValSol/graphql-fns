// @flow
/* eslint-env jest */

import type { EntityConfig } from '../flowTypes';

import composeTextIndexProperties from './composeTextIndexProperties';

describe('composeTextIndexProperties', () => {
  test('should compose schema properties with text fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          index: true,
          weight: 10,
        },
        {
          name: 'textField2',
          default: 'default text',
          weight: 20,
        },
        {
          name: 'textField3',
          required: true,
          unique: true,
          weight: 30,
        },
        {
          name: 'textField4',
          array: true,
          weight: 40,
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
        },
        {
          name: 'textField6',
          unique: true,
        },
      ],
    };
    const expectedResult = {
      textField1: 10,
      textField2: 20,
      textField3: 30,
      textField4: 40,
    };

    const result = composeTextIndexProperties(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
