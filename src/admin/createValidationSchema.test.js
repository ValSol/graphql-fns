// @flow
/* eslint-env jest */

import * as yup from 'yup';

import type { ThingConfig } from '../flowTypes';

import createValidationSchema from './createValidationSchema';

describe('createValidationSchema', () => {
  test('should create the simplest validation schema', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    });

    const expectedResult = yup.object().shape({
      textField: yup.string(),
    });

    const result = createValidationSchema(thingConfig);
    expect(result.describe()).toEqual(expectedResult.describe());
  });

  test('should create the validation schema with required field', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          required: true,
        },
      ],
    });

    const expectedResult = yup.object().shape({
      // ! test does not differentiate ".required('Required')" and ".required()",
      textField: yup.string().required('Required'),
    });

    const result = createValidationSchema(thingConfig);
    expect(result.describe()).toEqual(expectedResult.describe());
  });

  test('should create the validation schema with array field', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textFields',
          array: true,
        },
      ],
    });

    const expectedResult = yup.object().shape({
      textFields: yup.array().of(yup.string().required('Required')),
    });

    const result = createValidationSchema(thingConfig);
    expect(result.describe()).toEqual(expectedResult.describe());
  });

  test('should create the validation schema with embedded field', () => {
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      textFields: [
        {
          name: 'textField',
          required: true,
        },
      ],
    };
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      embeddedFields: [
        {
          name: 'embeddedField',
          config: embeddedConfig,
        },
      ],
    });

    const expectedResult = yup.object().shape({
      embeddedField: yup.object().shape({ textField: yup.string().required('Required') }),
    });

    const result = createValidationSchema(thingConfig);
    expect(result.describe()).toEqual(expectedResult.describe());
  });

  test('should create the validation schema with embedded array field', () => {
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      embeddedFields: [
        {
          name: 'embeddedFields',
          config: embeddedConfig,
          array: true,
        },
      ],
    });

    const expectedResult = yup.object().shape({
      embeddedFields: yup.array().of(yup.object().shape({ textField: yup.string() })),
    });

    const result = createValidationSchema(thingConfig);
    expect(result.describe()).toEqual(expectedResult.describe());
  });

  test('should create the validation schema with float field', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      floatFields: [
        {
          name: 'floatField',
        },
      ],
    });

    const expectedResult = yup.object().shape({
      floatField: yup.number(),
    });

    const result = createValidationSchema(thingConfig);
    expect(result.describe()).toEqual(expectedResult.describe());
  });

  test('should create the validation schema with int field', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      intFields: [
        {
          name: 'intField',
        },
      ],
    });

    const expectedResult = yup.object().shape({
      intField: yup.number().integer(),
    });

    const result = createValidationSchema(thingConfig);
    expect(result.describe()).toEqual(expectedResult.describe());
  });
});
