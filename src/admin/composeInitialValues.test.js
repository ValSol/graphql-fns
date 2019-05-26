// @flow
/* eslint-env jest */
import type { ThingConfig } from '../flowTypes';

import composeInitialValues from './composeInitialValues';

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

  test('should create the valcomposeFlatFormikFieldsation schema with array field', () => {
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

  test('should create the valcomposeFlatFormikFieldsation schema with default array field', () => {
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

  test('should create the valcomposeFlatFormikFieldsation schema with default array field and data', () => {
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

  test('should create the valcomposeFlatFormikFieldsation schema with embedded field', () => {
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

  test('should create the valcomposeFlatFormikFieldsation schema with embedded field and data', () => {
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

  test('should create the valcomposeFlatFormikFieldsation schema with embedded array field', () => {
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

  test('should create the valcomposeFlatFormikFieldsation schema with embedded array field with data', () => {
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

  test('should create the emebeded initial values with default data', () => {
    const embedded3Config: ThingConfig = {
      name: 'Embedded3',
      embedded: true,
      textFields: [
        {
          name: 'textField3',
          required: true,
          default: 'default3',
        },
      ],
    };

    const embedded2Config: ThingConfig = {
      name: 'Embedded2',
      embedded: true,
      textFields: [
        {
          name: 'textField2',
          required: true,
          default: 'default2',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded3',
          config: embedded3Config,
        },
      ],
    };

    const embedded1Config: ThingConfig = {
      name: 'Embedded1',
      embedded: true,
      textFields: [
        {
          name: 'textField1',
          required: true,
          default: 'default1',
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
          required: true,
          default: 'default',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded1',
          config: embedded1Config,
        },
      ],
    };

    const expectedResult = {
      textField: 'default',
      embedded1: {
        textField1: 'default1',
        embedded2: {
          textField2: 'default2',
          embedded3: { textField3: 'default3' },
        },
      },
    };

    const result = composeInitialValues(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
