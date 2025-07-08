/* eslint-env jest */

import type { EntityConfig } from '../../../tsTypes';

import addIdsToEntity from '.';

describe('addIdsToEntity', () => {
  test('shoud replace _ids by ids', () => {
    const embedded3Config: EntityConfig = {
      name: 'Embedded3',
      type: 'embedded',
      textFields: [
        {
          name: 'textField3',
          type: 'textFields',
        },
      ],
    };

    const embedded2Config: EntityConfig = {
      name: 'Embedded2',
      type: 'embedded',
      textFields: [
        {
          name: 'textField2',
          type: 'textFields',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded3',
          config: embedded3Config,
          array: true,
          type: 'embeddedFields',
          variants: ['plain'],
        },
      ],
    };

    const embedded1Config: EntityConfig = {
      name: 'Embedded1',
      type: 'embedded',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded2',
          config: embedded2Config,
          type: 'embeddedFields',
          variants: ['plain'],
        },
      ],
    };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded1',
          config: embedded1Config,
          type: 'embeddedFields',
          variants: ['plain'],
        },
      ],
    };

    const data = {
      _id: '0',
      textField: 'textField TEXT',

      embedded1: {
        _id: '1',
        textField1: 'textField1 TEXT',
        embedded2: {
          _id: '2',
          textField2: 'textField2 TEXT',
          embedded3: [
            {
              _id: '3-0',
              textField3: 'textField3 TEXT-0',
            },
            {
              _id: '3-1',
              textField3: 'textField3 TEXT-1',
            },
          ],
        },
      },
    };

    const result = addIdsToEntity(data, entityConfig);
    const expectedResult = {
      id: '0',
      textField: 'textField TEXT',

      embedded1: {
        id: '1',
        textField1: 'textField1 TEXT',
        embedded2: {
          id: '2',
          textField2: 'textField2 TEXT',
          embedded3: [
            {
              id: '3-0',
              textField3: 'textField3 TEXT-0',
            },
            {
              id: '3-1',
              textField3: 'textField3 TEXT-1',
            },
          ],
        },
      },
    };
    expect(result).toEqual(expectedResult);
  });
});
