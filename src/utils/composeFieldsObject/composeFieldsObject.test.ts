/* eslint-env jest */
import type { TangibleEntityConfig } from '../../tsTypes';

import composeFieldsObject from '.';

describe('composeFieldsObject', () => {
  test('simple config', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
        {
          name: 'textField2',
          default: 'default text',
          type: 'textFields',
        },
        {
          name: 'textField3',
          required: true,
          type: 'textFields',
        },
        {
          name: 'textField4',
          array: true,
          type: 'textFields',
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
          type: 'textFields',
        },
      ],

      calculatedFields: [
        {
          name: 'simpleCalculatedText',
          calculatedType: 'textFields',
          type: 'calculatedFields',
          fieldsToUseNames: ['textField1', 'textField2'],
          func: 'DYMMY function ONLY for test' as any,
          required: true,
        },
      ],
    };

    const result = composeFieldsObject(entityConfig);

    const expectedResult = {
      textField1: {
        name: 'textField1',
        type: 'textFields',
      },
      textField2: {
        default: 'default text',
        name: 'textField2',
        type: 'textFields',
      },
      textField3: {
        name: 'textField3',
        required: true,
        type: 'textFields',
      },
      textField4: {
        array: true,
        name: 'textField4',
        type: 'textFields',
      },
      textField5: {
        array: true,
        default: ['default text'],
        name: 'textField5',
        required: true,
        type: 'textFields',
      },
      simpleCalculatedText: {
        name: 'simpleCalculatedText',
        calculatedType: 'textFields',
        type: 'calculatedFields',
        fieldsToUseNames: ['textField1', 'textField2'],
        func: 'DYMMY function ONLY for test',
        required: true,
      },
    };

    expect(result).toEqual(expectedResult);

    const withoutCalculatedFieldsWithAsyncFuncResult = composeFieldsObject(entityConfig, {
      withoutCalculatedFieldsWithAsyncFunc: true,
    });

    expect(withoutCalculatedFieldsWithAsyncFuncResult).toEqual(expectedResult);
  });

  describe('calculatedFields', () => {
    test('without asyncFunc', () => {
      const entityConfig: TangibleEntityConfig = {
        name: 'Example',
        type: 'tangible',

        calculatedFields: [
          {
            name: 'simpleCalculatedText',
            calculatedType: 'textFields',
            type: 'calculatedFields',
            fieldsToUseNames: ['textField1', 'textField2'],
            func: 'DYMMY function ONLY for test' as any,
            required: true,
          },
        ],
      };

      const result = composeFieldsObject(entityConfig);

      const expectedResult = {
        simpleCalculatedText: {
          name: 'simpleCalculatedText',
          calculatedType: 'textFields',
          type: 'calculatedFields',
          fieldsToUseNames: ['textField1', 'textField2'],
          func: 'DYMMY function ONLY for test',
          required: true,
        },
      };
      expect(result).toEqual(expectedResult);

      const withoutCalculatedFieldsWithAsyncFuncResult = composeFieldsObject(entityConfig, {
        withoutCalculatedFieldsWithAsyncFunc: true,
      });

      expect(withoutCalculatedFieldsWithAsyncFuncResult).toEqual(expectedResult);
    });

    test('with asyncFunc', () => {
      const entityConfig: TangibleEntityConfig = {
        name: 'Example',
        type: 'tangible',

        calculatedFields: [
          {
            name: 'simpleCalculatedText',
            calculatedType: 'textFields',
            type: 'calculatedFields',
            fieldsToUseNames: ['textField1', 'textField2'],
            func: 'DYMMY function ONLY for test' as any,
            required: true,
          },

          {
            name: 'asyncCalculatedText',
            calculatedType: 'textFields',
            type: 'calculatedFields',
            fieldsToUseNames: [],
            func: 'DYMMY function ONLY for test' as any,
            asyncFunc: 'DYMMY async function ONLY for test' as any,
            required: true,
          },
        ],
      };

      const result = composeFieldsObject(entityConfig);

      const expectedResult = {
        simpleCalculatedText: {
          name: 'simpleCalculatedText',
          calculatedType: 'textFields',
          type: 'calculatedFields',
          fieldsToUseNames: ['textField1', 'textField2'],
          func: 'DYMMY function ONLY for test',
          required: true,
        },

        asyncCalculatedText: {
          name: 'asyncCalculatedText',
          calculatedType: 'textFields',
          type: 'calculatedFields',
          fieldsToUseNames: [],
          func: 'DYMMY function ONLY for test' as any,
          asyncFunc: 'DYMMY async function ONLY for test' as any,
          required: true,
        },
      };

      expect(result).toEqual(expectedResult);

      const withoutCalculatedFieldsWithAsyncFuncResult = composeFieldsObject(entityConfig, {
        withoutCalculatedFieldsWithAsyncFunc: true,
      });

      const expectedWithoutCalculatedFieldsWithAsyncFuncResult = {
        simpleCalculatedText: {
          name: 'simpleCalculatedText',
          calculatedType: 'textFields',
          type: 'calculatedFields',
          fieldsToUseNames: ['textField1', 'textField2'],
          func: 'DYMMY function ONLY for test',
          required: true,
        },
      };

      expect(withoutCalculatedFieldsWithAsyncFuncResult).toEqual(
        expectedWithoutCalculatedFieldsWithAsyncFuncResult,
      );
    });
  });
});
