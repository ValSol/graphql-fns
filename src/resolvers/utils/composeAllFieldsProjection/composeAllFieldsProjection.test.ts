/* eslint-env jest */
import type { TangibleEntityConfig } from '../../../tsTypes';

import composeAllFieldsProjection from '.';

describe('composeAllFieldsProjection', () => {
  test('should create object with simple fields', () => {
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
    };

    const result = composeAllFieldsProjection(entityConfig);

    const expectedResult = {
      createdAt: 1,
      textField1: 1,
      textField2: 1,
      textField3: 1,
      textField4: 1,
      textField5: 1,
      updatedAt: 1,
    };

    expect(result).toEqual(expectedResult);
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

      const result = composeAllFieldsProjection(entityConfig);

      const expectedResult = {
        createdAt: 1,
        updatedAt: 1,
        simpleCalculatedText: 1,
      };
      expect(result).toEqual(expectedResult);

      const withoutCalculatedFieldsWithAsyncFuncResult = composeAllFieldsProjection(entityConfig, {
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

      const result = composeAllFieldsProjection(entityConfig);

      const expectedResult = {
        createdAt: 1,
        updatedAt: 1,
        simpleCalculatedText: 1,
        asyncCalculatedText: 1,
      };

      expect(result).toEqual(expectedResult);

      const withoutCalculatedFieldsWithAsyncFuncResult = composeAllFieldsProjection(entityConfig, {
        withoutCalculatedFieldsWithAsyncFunc: true,
      });

      const expectedWithoutCalculatedFieldsWithAsyncFuncResult = {
        createdAt: 1,
        updatedAt: 1,
        simpleCalculatedText: 1,
      };

      expect(withoutCalculatedFieldsWithAsyncFuncResult).toEqual(
        expectedWithoutCalculatedFieldsWithAsyncFuncResult,
      );
    });
  });
});
