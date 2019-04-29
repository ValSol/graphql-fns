// @flow
/* eslint-env jest */
const composeGqlResolvers = require('./composeGqlResolvers');

describe('composeGqlResolvers', () => {
  test('should create things types for one thing', () => {
    const thingConfig = {
      name: 'Example',
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
    expect(typeof result.Mutation.updateExample).toBe('function');
    expect(typeof result.Mutation.deleteExample).toBe('function');
  });
  test('should create things types for two things', () => {
    const thingConfig1 = {
      name: 'Example1',
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
      name: 'Example2',
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
    expect(typeof result.Mutation.updateExample1).toBe('function');
    expect(typeof result.Mutation.updateExample2).toBe('function');
    expect(typeof result.Mutation.deleteExample1).toBe('function');
    expect(typeof result.Mutation.deleteExample2).toBe('function');
  });
  test('should create things types for two things with relational things', () => {
    const placeConfig = {
      name: 'Place',
      textFields: [
        {
          name: 'title',
          required: true,
        },
      ],
    };
    const personConfig = {
      name: 'Person',
      textFields: [],
      relationalFields: [],
    };
    Object.assign(personConfig, {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      relationalFields: [
        {
          name: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          config: personConfig,
          array: true,
        },
        {
          name: 'location',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favoritePlace',
          config: placeConfig,
        },
      ],
    });
    const thingConfigs = [personConfig, placeConfig];
    const result = composeGqlResolvers(thingConfigs);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.Person).toBe('function');
    expect(typeof result.Query.Place).toBe('function');
    expect(typeof result.Query.People).toBe('function');
    expect(typeof result.Query.Places).toBe('function');
    expect(typeof result.Mutation.createPerson).toBe('function');
    expect(typeof result.Mutation.createPlace).toBe('function');
    expect(typeof result.Mutation.updatePerson).toBe('function');
    expect(typeof result.Mutation.updatePlace).toBe('function');
    expect(typeof result.Mutation.deletePerson).toBe('function');
    expect(typeof result.Mutation.deletePlace).toBe('function');
    expect(typeof result.Person.friends).toBe('function');
    expect(typeof result.Person.enemies).toBe('function');
    expect(typeof result.Person.location).toBe('function');
    expect(typeof result.Person.favoritePlace).toBe('function');
  });
  test('should create things types for two things with re', () => {
    const addressConfig = {
      name: 'Address',
      isEmbedded: true,
      textFields: [
        {
          name: 'country',
          required: true,
          default: 'Ukraine',
        },
        {
          name: 'province',
        },
      ],
    };
    const personConfig = {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      embeddedFields: [
        {
          name: 'location',
          config: addressConfig,
          required: true,
        },
        {
          name: 'locations',
          array: true,
          config: addressConfig,
          required: true,
        },
        {
          name: 'place',
          config: addressConfig,
        },
        {
          name: 'places',
          array: true,
          config: addressConfig,
        },
      ],
    };
    const thingConfigs = [personConfig, addressConfig];
    const result = composeGqlResolvers(thingConfigs);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.Person).toBe('function');
    expect(typeof result.Query.People).toBe('function');
    expect(typeof result.Mutation.createPerson).toBe('function');
    expect(typeof result.Mutation.updatePerson).toBe('function');
    expect(typeof result.Mutation.deletePerson).toBe('function');
    expect(result.Query.Address).toBeUndefined();
    expect(result.Mutation.createAddress).toBeUndefined();
  });
  test('should create things types for two things with duplex things', () => {
    const personConfig = {
      name: 'Person',
      textFields: [],
      duplexFields: [],
    };
    const placeConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
        },
      ],
    });

    const thingConfigs = [personConfig, placeConfig];
    const result = composeGqlResolvers(thingConfigs);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.Person).toBe('function');
    expect(typeof result.Query.Place).toBe('function');
    expect(typeof result.Query.People).toBe('function');
    expect(typeof result.Query.Places).toBe('function');
    expect(typeof result.Mutation.createPerson).toBe('function');
    expect(typeof result.Mutation.createPlace).toBe('function');
    expect(typeof result.Mutation.updatePerson).toBe('function');
    expect(typeof result.Mutation.updatePlace).toBe('function');
    expect(typeof result.Mutation.deletePerson).toBe('function');
    expect(typeof result.Mutation.deletePlace).toBe('function');
    expect(typeof result.Person.friends).toBe('function');
    expect(typeof result.Person.enemies).toBe('function');
    expect(typeof result.Person.location).toBe('function');
    expect(typeof result.Person.favoritePlace).toBe('function');
    expect(typeof result.Place.citizens).toBe('function');
    expect(typeof result.Place.visitors).toBe('function');
  });
});
