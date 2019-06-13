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
          name: 'floatField1',
        },
        {
          name: 'floatField2',
          required: true,
        },
        {
          name: 'floatField3',
          array: true,
        },
      ],
    });

    const expectedResult = yup.object().shape({
      floatField1: yup.number(),
      floatField2: yup.number().required(),
      floatField3: yup.array().of(yup.number().required()),
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
          name: 'intField1',
        },
        {
          name: 'intField2',
          required: true,
        },
        {
          name: 'intField3',
          array: true,
        },
      ],
    });

    const expectedResult = yup.object().shape({
      intField1: yup.number().integer(),
      intField2: yup
        .number()
        .integer()
        .required(),
      intField3: yup.array().of(
        yup
          .number()
          .integer()
          .required(),
      ),
    });

    const result = createValidationSchema(thingConfig);
    expect(result.describe()).toEqual(expectedResult.describe());
  });

  test('should create the validation schema with boolean field', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      booleanFields: [
        {
          name: 'booleanField1',
        },
        {
          name: 'booleanField2',
          array: true,
        },
      ],
    });

    const expectedResult = yup.object().shape({
      booleanField1: yup.boolean(),
      booleanField2: yup.array().of(yup.boolean()),
    });

    const result = createValidationSchema(thingConfig);
    expect(result.describe()).toEqual(expectedResult.describe());
  });

  test('should create the validation schema with enum field', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      enumFields: [
        {
          name: 'enumField1',
          enumName: 'SomeEnum',
        },
        {
          name: 'enumField2',
          enumName: 'SomeEnum',
          required: true,
        },
        {
          name: 'enumField3',
          enumName: 'SomeEnum',
          array: true,
        },
      ],
    });

    const expectedResult = yup.object().shape({
      enumField1: yup.string(),
      enumField2: yup.string().required(),
      enumField3: yup.array().of(yup.string().required()),
    });

    const result = createValidationSchema(thingConfig);
    expect(result.describe()).toEqual(expectedResult.describe());
  });

  test('should create the validation schema with relational and duplex field', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
        },
        {
          name: 'relationalField2',
          config: thingConfig,
          required: true,
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexField',
        },
        {
          name: 'duplexField2',
          config: thingConfig,
          oppositeName: 'duplexField',
          required: true,
        },
      ],
    });

    const expectedResult = yup.object().shape({
      relationalField: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, { message: 'mongoose id', excludeEmptyString: true })
        .test('existence-Example', 'Existence', async function test2() {}), // eslint-disable-line no-empty-function
      relationalField2: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, { message: 'mongoose id', excludeEmptyString: true })
        .required()
        .test('existence-Example', 'Existence', async function test2() {}), // eslint-disable-line no-empty-function
      duplexField: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, { message: 'mongoose id', excludeEmptyString: true })
        .test('existence-Example', 'Existence', async function test2() {}), // eslint-disable-line no-empty-function
      duplexField2: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, { message: 'mongoose id', excludeEmptyString: true })
        .required()
        .test('existence-Example', 'Existence', async function test2() {}), // eslint-disable-line no-empty-function
    });

    const result = createValidationSchema(thingConfig);
    expect(result.describe()).toEqual(expectedResult.describe());
  });
});
