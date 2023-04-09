/* eslint-env jest */

import type { EntityConfig } from '../tsTypes';

import composeTextIndexProperties from './composeTextIndexProperties';

describe('composeTextIndexProperties', () => {
  test('should compose schema properties with text fields', () => {
    const child3Config: EntityConfig = {
      name: 'Child3',
      type: 'embedded',

      textFields: [
        {
          name: 'name3',
          weight: 3,
          type: 'textFields',
        },
      ],
    };

    const child2Config: EntityConfig = {
      name: 'Child2',
      type: 'embedded',

      textFields: [
        {
          name: 'name2',
          weight: 2,
          type: 'textFields',
        },
      ],

      embeddedFields: [
        {
          name: 'embedded3',
          config: child3Config,
          type: 'embeddedFields',
        },
      ],
    };

    const childConfig: EntityConfig = {
      name: 'Child',
      type: 'embedded',

      textFields: [
        {
          name: 'name',
          weight: 1,
          type: 'textFields',
        },
      ],

      embeddedFields: [
        {
          name: 'embedded2',
          config: child2Config,
          type: 'embeddedFields',
        },
      ],
    };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          index: true,
          weight: 10,
          type: 'textFields',
        },
        {
          name: 'textField2',
          default: 'default text',
          weight: 20,
          type: 'textFields',
        },
        {
          name: 'textField3',
          required: true,
          unique: true,
          weight: 30,
          type: 'textFields',
        },
        {
          name: 'textField4',
          array: true,
          weight: 40,
          type: 'textFields',
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
          type: 'textFields',
        },
        {
          name: 'textField6',
          unique: true,
          type: 'textFields',
        },
      ],

      embeddedFields: [
        {
          name: 'embedded',
          config: childConfig,
          index: true,
          type: 'embeddedFields',
        },
      ],
    };

    const expectedResult = {
      textField1: 10,
      textField2: 20,
      textField3: 30,
      textField4: 40,
      'embedded.name': 1,
      'embedded.embedded2.name2': 2,
      'embedded.embedded2.embedded3.name3': 3,
    };

    const result = composeTextIndexProperties(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
