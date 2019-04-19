// @flow
/* eslint-env jest */
const composeThingResolvers = require('./composeThingResolvers');

describe('composeThingResolvers', () => {
  test('should create resolver for type', () => {
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
          config: personConfig,
        },
      ],
    });

    const result = composeThingResolvers(personConfig);

    expect(typeof result.friends).toBe('function');
    expect(typeof result.enemies).toBe('function');
    expect(typeof result.location).toBe('function');
    expect(typeof result.favoritePlace).toBe('function');
  });
  test('should create resolver for type', () => {
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

    const result = composeThingResolvers(personConfig);

    expect(typeof result.friends).toBe('function');
    expect(typeof result.enemies).toBe('function');
    expect(typeof result.location).toBe('function');
    expect(typeof result.favoritePlace).toBe('function');
  });
});
