// @flow
/* eslint-env jest */
const transformInputData = require('./transformInputData');

describe('transformInputData', () => {
  test('should create object with simple fields', () => {
    const thingConfig = {
      name: 'Thing',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
        },
      ],
    };
    const data = {
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
    };

    const expectedResult = {
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
    };
    const result = transformInputData(data, thingConfig);

    expect(result).toEqual(expectedResult);
  });
  test('should create object with self relation fields', () => {
    const thingConfig = {
      name: 'Thing',
      textFields: [],
      relationalFields: [],
    };
    Object.assign(thingConfig, {
      name: 'Thing',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
        },
      ],
      relationalFields: [
        {
          name: 'relationalField1',
          config: thingConfig,
        },
        {
          name: 'relationalField2',
          config: thingConfig,
          array: true,
        },
      ],
    });
    const data = {
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
      relationalField1: { connect: '5caf757d62552d713461f420' },
      relationalField2: { connect: ['5caf757d62552d713461f420', '5cb0ab5a448c440720cf2594'] },
    };

    const expectedResult = {
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
      relationalField1: '5caf757d62552d713461f420',
      relationalField2: ['5caf757d62552d713461f420', '5cb0ab5a448c440720cf2594'],
    };

    const result = transformInputData(data, thingConfig);

    expect(result).toEqual(expectedResult);
  });
  test('should create object with embedded fields with relation fields', () => {
    const embedded1Config = {
      name: 'Embedded1',
      textFields: [],
      embeddedFields: [],
    };

    const embedded2Config = {
      name: 'Embedded2',
      textFields: [],
      relationalFields: [],
    };

    const thingConfig = {
      name: 'Thing',
      textFields: [],
      embeddedFields: [],
    };

    Object.assign(embedded1Config, {
      name: 'Embedded1',
      textFields: [{ name: 'textField_e1' }],
      embeddedFields: [{ name: 'embeddedField2', config: embedded2Config }],
    });

    Object.assign(embedded2Config, {
      name: 'Embedded2',
      textFields: [{ name: 'textField_e2' }],
      relationalFields: [{ name: 'relationalField', config: thingConfig }],
    });

    Object.assign(thingConfig, {
      name: 'Thing',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField1',
          config: embedded1Config,
        },
      ],
    });
    const data = {
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
      embeddedField1: {
        textField_e1: 'textField_e1-value',
        embeddedField2: {
          textField_e2: 'textField_e2-value',
          relationalField: { connect: '5caf757d62552d713461f420' },
        },
      },
    };

    const expectedResult = {
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
      embeddedField1: {
        textField_e1: 'textField_e1-value',
        embeddedField2: {
          textField_e2: 'textField_e2-value',
          relationalField: '5caf757d62552d713461f420',
        },
      },
    };

    const result = transformInputData(data, thingConfig);

    expect(result).toEqual(expectedResult);
  });
});
