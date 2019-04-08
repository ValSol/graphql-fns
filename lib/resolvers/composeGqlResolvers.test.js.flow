// @flow
/* eslint-env jest */
const composeGqlResolvers = require('./composeGqlResolvers');

describe('composeGqlResolvers', () => {
  test('should create things types for one thing', () => {
    const thingConfig = {
      thingName: 'Example',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
          default: 'default text',
        },
        {
          name: 'textField3',
          required: true,
        },
        {
          name: 'textField4',
          array: true,
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const result = composeGqlResolvers(thingConfigs);
    expect(typeof result.Query.Example).toBe('function');
    expect(typeof result.Mutation.createExample).toBe('function');
  });
  test('should create things types for two things', () => {
    const thingConfig1 = {
      thingName: 'Example1',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
          default: 'default text',
        },
        {
          name: 'textField3',
          required: true,
        },
      ],
    };
    const thingConfig2 = {
      thingName: 'Example2',
      textFields: [
        {
          name: 'textField1',
          array: true,
        },
        {
          name: 'textField2',
          default: ['default text'],
          required: true,
          array: true,
        },
      ],
    };
    const thingConfigs = [thingConfig1, thingConfig2];
    const result = composeGqlResolvers(thingConfigs);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.Example1).toBe('function');
    expect(typeof result.Query.Example2).toBe('function');
    expect(typeof result.Mutation.createExample1).toBe('function');
    expect(typeof result.Mutation.createExample2).toBe('function');
  });
});
