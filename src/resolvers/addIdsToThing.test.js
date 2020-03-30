// @flow
/* eslint-env jest */

import type { ThingConfig } from '../flowTypes';

import addIdsToThing from './addIdsToThing';

describe('addIdsToThing', () => {
  test('shoud replace _ids by ids', () => {
    const embedded3Config: ThingConfig = {
      name: 'Embedded3',
      embedded: true,
      textFields: [
        {
          name: 'textField3',
        },
      ],
    };

    const embedded2Config: ThingConfig = {
      name: 'Embedded2',
      embedded: true,
      textFields: [
        {
          name: 'textField2',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded3',
          config: embedded3Config,
          array: true,
        },
      ],
    };

    const embedded1Config: ThingConfig = {
      name: 'Embedded1',
      embedded: true,
      textFields: [
        {
          name: 'textField1',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded2',
          config: embedded2Config,
        },
      ],
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded1',
          config: embedded1Config,
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

    const result = addIdsToThing(data, thingConfig);
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
