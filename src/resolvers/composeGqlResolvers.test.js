// @flow
/* eslint-env jest */
import type { GeneralConfig, Inventory, ThingConfig } from '../flowTypes';

const composeGqlResolvers = require('./composeGqlResolvers');

describe('composeGqlResolvers', () => {
  test('should create things types for one thing', () => {
    const thingConfig: ThingConfig = {
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
    const generalConfig: GeneralConfig = { thingConfigs };
    const result = composeGqlResolvers(generalConfig);
    expect(typeof result.Query.ExampleCount).toBe('function');
    expect(typeof result.Query.Example).toBe('function');
    expect(typeof result.Query.Examples).toBe('function');
    expect(typeof result.Mutation.createExample).toBe('function');
    expect(typeof result.Mutation.updateExample).toBe('function');
    expect(typeof result.Mutation.deleteExample).toBe('function');
    expect(typeof result.Subscription.newExample.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedExample.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedExample.subscribe).toBe('function');
  });

  test('should create things types for two things', () => {
    const thingConfig1: ThingConfig = {
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
    const thingConfig2: ThingConfig = {
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
    const generalConfig: GeneralConfig = { thingConfigs };
    const result = composeGqlResolvers(generalConfig);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.Example1Count).toBe('function');
    expect(typeof result.Query.Example1).toBe('function');
    expect(typeof result.Query.Example1S).toBe('function');
    expect(typeof result.Query.Example2Count).toBe('function');
    expect(typeof result.Query.Example2).toBe('function');
    expect(typeof result.Query.Example2S).toBe('function');
    expect(typeof result.Mutation.createExample1).toBe('function');
    expect(typeof result.Mutation.createExample2).toBe('function');
    expect(typeof result.Mutation.updateExample1).toBe('function');
    expect(typeof result.Mutation.updateExample2).toBe('function');
    expect(typeof result.Mutation.deleteExample1).toBe('function');
    expect(typeof result.Mutation.deleteExample2).toBe('function');
    expect(typeof result.Subscription.newExample1.subscribe).toBe('function');
    expect(typeof result.Subscription.newExample2.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedExample1.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedExample2.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedExample1.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedExample2.subscribe).toBe('function');
  });

  test('should create things types for two things with relational things', () => {
    const placeConfig: ThingConfig = {
      name: 'Place',
      textFields: [
        {
          name: 'title',
          required: true,
        },
      ],
    };
    const personConfig: ThingConfig = {};
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
    const generalConfig: GeneralConfig = { thingConfigs };
    const result = composeGqlResolvers(generalConfig);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.PersonCount).toBe('function');
    expect(typeof result.Query.PlaceCount).toBe('function');
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
    expect(typeof result.Subscription.newPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.newPlace.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedPlace.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedPlace.subscribe).toBe('function');
  });

  test('should create things types for two things with embedded fields', () => {
    const addressConfig: ThingConfig = {
      name: 'Address',
      embedded: true,
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
    const personConfig: ThingConfig = {
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
    const generalConfig: GeneralConfig = { thingConfigs };
    const result = composeGqlResolvers(generalConfig);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.PersonCount).toBe('function');
    expect(typeof result.Query.Person).toBe('function');
    expect(typeof result.Query.People).toBe('function');
    expect(typeof result.Mutation.createPerson).toBe('function');
    expect(typeof result.Mutation.updatePerson).toBe('function');
    expect(typeof result.Mutation.deletePerson).toBe('function');
    expect(result.Query.Address).toBeUndefined();
    expect(result.Mutation.createAddress).toBeUndefined();
    expect(typeof result.Subscription.newPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedPerson.subscribe).toBe('function');
  });

  test('should create things types for two things with duplex things', () => {
    const personConfig: ThingConfig = {};
    const placeConfig: ThingConfig = {
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
    const generalConfig: GeneralConfig = { thingConfigs };
    const result = composeGqlResolvers(generalConfig);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.PersonCount).toBe('function');
    expect(typeof result.Query.PlaceCount).toBe('function');
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
    expect(typeof result.Subscription.newPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.newPlace.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedPlace.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedPlace.subscribe).toBe('function');
  });

  test('should create things types for two things with geospatial fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      geospatialFields: [
        {
          name: 'pointField1',
          geospatialType: 'Point',
        },
        {
          name: 'pointField2',
          required: true,
          geospatialType: 'Point',
        },
        {
          name: 'pointField3',
          array: true,
          geospatialType: 'Point',
        },
        {
          name: 'pointField4',
          array: true,
          required: true,
          geospatialType: 'Point',
        },
        {
          name: 'polygonField1',
          geospatialType: 'Polygon',
        },
        {
          name: 'polygonField2',
          required: true,
          geospatialType: 'Polygon',
        },
        {
          name: 'polygonField3',
          array: true,
          geospatialType: 'Polygon',
        },
        {
          name: 'polygonField4',
          array: true,
          required: true,
          geospatialType: 'Polygon',
        },
      ],
    };

    const thingConfigs = [thingConfig];
    const generalConfig: GeneralConfig = { thingConfigs };
    const result = composeGqlResolvers(generalConfig);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.ExampleCount).toBe('function');
    expect(typeof result.Query.Example).toBe('function');
    expect(typeof result.Query.Examples).toBe('function');
    expect(typeof result.Mutation.createExample).toBe('function');
    expect(typeof result.Mutation.updateExample).toBe('function');
    expect(typeof result.Mutation.deleteExample).toBe('function');
    expect(typeof result.Example.pointField1).toBe('function');
    expect(typeof result.Example.pointField2).toBe('function');
    expect(typeof result.Example.pointField3).toBe('function');
    expect(typeof result.Example.pointField4).toBe('function');
    expect(typeof result.Example.polygonField1).toBe('function');
    expect(typeof result.Example.polygonField2).toBe('function');
    expect(typeof result.Example.polygonField3).toBe('function');
    expect(typeof result.Example.polygonField4).toBe('function');
    expect(typeof result.Subscription.newExample.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedExample.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedExample.subscribe).toBe('function');
  });

  test('should create things types for one thing with inventory for only queries', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const inventory: Inventory = { include: { Query: null } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const result = composeGqlResolvers(generalConfig);
    expect(typeof result.Query.ExampleCount).toBe('function');
    expect(typeof result.Query.Example).toBe('function');
    expect(typeof result.Query.Examples).toBe('function');
    expect(result.Mutation).toBeUndefined();
    expect(result.Subscription).toBeUndefined();
  });

  test('should create things types for one thing with inventory for only mutations', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const inventory: Inventory = { include: { Mutation: null } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const result = composeGqlResolvers(generalConfig);
    expect(result.Query).toBeUndefined();
    expect(typeof result.Mutation.createExample).toBe('function');
    expect(typeof result.Mutation.updateExample).toBe('function');
    expect(typeof result.Mutation.deleteExample).toBe('function');
    expect(result.Subscription).toBeUndefined();
  });

  test('should create things types for one thing with inventory for only thing queries', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const inventory: Inventory = { include: { Query: { thing: null } } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const result = composeGqlResolvers(generalConfig);
    expect(result.Query.ExampleCount).toBeUndefined();
    expect(typeof result.Query.Example).toBe('function');
    expect(result.Query.Examples).toBeUndefined();
    expect(result.Mutation).toBeUndefined();
    expect(result.Subscription).toBeUndefined();
  });

  test('should create things types for one thing with inventory for only mutations', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const inventory: Inventory = { include: { Mutation: { createThing: null } } };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const result = composeGqlResolvers(generalConfig);
    expect(result.Query).toBeUndefined();
    expect(typeof result.Mutation.createExample).toBe('function');
    expect(result.Mutation.updateExample).toBeUndefined();
    expect(result.Mutation.deleteExample).toBeUndefined();
    expect(result.Subscription).toBeUndefined();
  });
});
