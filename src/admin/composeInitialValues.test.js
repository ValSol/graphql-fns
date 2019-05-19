// @flow
/* eslint-env jest */
import type { ThingConfig } from '../flowTypes';

const composeInitialValues = require('./composeInitialValues');

describe('composeInitialValues', () => {
  test('should create the simplest initial values object', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    });

    const expectedResult = { textField: '' };

    const result = composeInitialValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the simplest initial default values object', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          default: 'textFieldDefaultValue',
        },
      ],
    });

    const expectedResult = { textField: 'textFieldDefaultValue' };

    const result = composeInitialValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the simplest initial values object with data', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          default: 'textFieldDefaultValue',
        },
      ],
    });
    const data = { textField: 'textFieldValue' };

    const expectedResult = { textField: 'textFieldValue' };

    const result = composeInitialValues(thingConfig, data);
    expect(result).toEqual(expectedResult);
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

    const expectedResult = { textFields: [] };

    const result = composeInitialValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the validation schema with default array field', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textFields',
          default: ['test'],
          array: true,
        },
      ],
    });

    const expectedResult = { textFields: ['test'] };

    const result = composeInitialValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the validation schema with default array field and data', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textFields',
          default: ['test'],
          array: true,
        },
      ],
    });
    const data = { textFields: ['test2'] };

    const expectedResult = { textFields: ['test2'] };

    const result = composeInitialValues(thingConfig, data);
    expect(result).toEqual(expectedResult);
  });

  test('should create the validation schema with embedded field', () => {
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
          name: 'embeddedField',
          config: embeddedConfig,
        },
      ],
    });

    const expectedResult = { embeddedField: { textField: '' } };

    const result = composeInitialValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the validation schema with embedded field and data', () => {
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
          name: 'embeddedField',
          config: embeddedConfig,
        },
      ],
    });
    const data = { embeddedField: { textField: 'testFieldValue' } };

    const expectedResult = { embeddedField: { textField: 'testFieldValue' } };

    const result = composeInitialValues(thingConfig, data);
    expect(result).toEqual(expectedResult);
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

    const expectedResult = { embeddedFields: [] };

    const result = composeInitialValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create the validation schema with embedded array field with data', () => {
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
    const data = { embeddedFields: [{ textField: 'textFieldValue' }] };

    const expectedResult = { embeddedFields: [{ textField: 'textFieldValue' }] };

    const result = composeInitialValues(thingConfig, data);
    expect(result).toEqual(expectedResult);
  });
});
