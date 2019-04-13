// @flow
/* eslint-env jest */
const composeThingResolvers = require('./composeThingResolvers');

describe('composeThingResolvers', () => {
  test('should create resolver for type', () => {
    const personConfig = {
      thingName: 'Person',
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
          thingName: 'Person',
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          thingName: 'Person',
          array: true,
        },
        {
          name: 'location',
          thingName: 'Place',
          required: true,
        },
        {
          name: 'favoritePlace',
          thingName: 'Place',
        },
      ],
    };

    const placeConfig = {
      thingName: 'Place',
      textFields: [
        {
          name: 'title',
          required: true,
        },
      ],
    };

    const thingConfigsObject = { Person: personConfig, Place: placeConfig };

    const result = composeThingResolvers(personConfig, thingConfigsObject);

    expect(typeof result.friends).toBe('function');
    expect(typeof result.enemies).toBe('function');
    expect(typeof result.location).toBe('function');
    expect(typeof result.favoritePlace).toBe('function');
  });
});
