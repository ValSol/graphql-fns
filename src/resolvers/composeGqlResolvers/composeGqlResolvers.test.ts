/* eslint-env jest */

import type {
  EmbeddedEntityConfig,
  GeneralConfig,
  Inventory,
  ServersideConfig,
  ActionSignatureMethods,
  TangibleEntityConfig,
} from '../../tsTypes';

import composeGqlTypes from '../../types/composeGqlTypes';
import composeGqlResolvers from '.';

describe('composeGqlResolvers', () => {
  test('should create resolvers for one entity', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
        {
          name: 'textField2',
          default: 'default text',
          type: 'textFields',
        },
        {
          name: 'textField3',
          required: true,
          type: 'textFields',
        },
        {
          name: 'textField4',
          array: true,
          type: 'textFields',
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
          type: 'textFields',
        },
      ],
    };
    const allEntityConfigs = { Example: entityConfig };
    const generalConfig: GeneralConfig = { allEntityConfigs };

    const { entityTypeDic } = composeGqlTypes(generalConfig);
    const result = composeGqlResolvers(generalConfig, entityTypeDic);

    expect(typeof result.Query.ExampleCount).toBe('function');
    expect(typeof result.Query.ExampleDistinctValues).toBe('function');
    expect(typeof result.Query.Example).toBe('function');
    expect(typeof result.Query.Examples).toBe('function');
    expect(typeof result.Mutation.createExample).toBe('function');
    expect(typeof result.Mutation.createManyExamples).toBe('function');
    expect(typeof result.Mutation.pushIntoExample).toBe('function');
    expect(typeof result.Mutation.updateExample).toBe('function');
    expect(typeof result.Mutation.deleteExample).toBe('function');
    expect(typeof result.Subscription.createdExample.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedExample.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedExample.subscribe).toBe('function');
  });

  test('should create resolvers for two entities', () => {
    const entityConfig1: TangibleEntityConfig = {
      name: 'Example1',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
        {
          name: 'textField2',
          default: 'default text',
          type: 'textFields',
        },
        {
          name: 'textField3',
          required: true,
          type: 'textFields',
        },
      ],
    };
    const entityConfig2: TangibleEntityConfig = {
      name: 'Example2',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          array: true,
          type: 'textFields',
        },
        {
          name: 'textField2',
          default: ['default text'],
          required: true,
          array: true,
          type: 'textFields',
        },
      ],
    };
    const allEntityConfigs = { Example1: entityConfig1, Example2: entityConfig2 };
    const generalConfig: GeneralConfig = { allEntityConfigs };

    const { entityTypeDic } = composeGqlTypes(generalConfig);
    const result = composeGqlResolvers(generalConfig, entityTypeDic);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.node).toBe('function');
    expect(typeof result.Query.Example1Count).toBe('function');
    expect(typeof result.Query.Example1DistinctValues).toBe('function');
    expect(typeof result.Query.Example1).toBe('function');
    expect(typeof result.Query.Example1s).toBe('function');
    expect(typeof result.Query.Example2Count).toBe('function');
    expect(typeof result.Query.Example2DistinctValues).toBe('function');
    expect(typeof result.Query.Example2).toBe('function');
    expect(typeof result.Query.Example2s).toBe('function');
    expect(typeof result.Mutation.createManyExample1s).toBe('function');
    expect(typeof result.Mutation.createManyExample2s).toBe('function');
    expect(typeof result.Mutation.createExample1).toBe('function');
    expect(typeof result.Mutation.createExample2).toBe('function');
    expect(typeof result.Mutation.pushIntoExample1).toBe('undefined');
    expect(typeof result.Mutation.pushIntoExample2).toBe('function');
    expect(typeof result.Mutation.updateExample1).toBe('function');
    expect(typeof result.Mutation.updateExample2).toBe('function');
    expect(typeof result.Mutation.deleteExample1).toBe('function');
    expect(typeof result.Mutation.deleteExample2).toBe('function');
    expect(typeof result.Subscription.createdExample1.subscribe).toBe('function');
    expect(typeof result.Subscription.createdExample2.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedExample1.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedExample2.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedExample1.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedExample2.subscribe).toBe('function');
  });

  test('should create resolvers for two entities with relational entities', () => {
    const personConfig = {} as TangibleEntityConfig;

    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [
        {
          name: 'title',
          required: true,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'fellows',
          oppositeName: 'friends',
          array: true,
          parent: true,
          config: personConfig,
          type: 'relationalFields',
        },
        {
          name: 'opponents',
          oppositeName: 'enemies',
          array: true,
          parent: true,
          config: personConfig,
          type: 'relationalFields',
        },
      ],
    };

    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'friends',
          oppositeName: 'fellows',
          config: personConfig,
          array: true,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'fellows',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'enemies',
          oppositeName: 'opponents',
          config: personConfig,
          type: 'relationalFields',
          array: true,
        },
        {
          name: 'opponents',
          oppositeName: 'enemies',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'location',
          oppositeName: 'citisens',
          config: placeConfig,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'customers',
          config: placeConfig,
          type: 'relationalFields',
        },
      ],
    });
    const allEntityConfigs = { Person: personConfig, Place: placeConfig };
    const generalConfig: GeneralConfig = { allEntityConfigs };

    const { entityTypeDic } = composeGqlTypes(generalConfig);
    const result = composeGqlResolvers(generalConfig, entityTypeDic);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.node).toBe('function');
    expect(typeof result.Query.PersonCount).toBe('function');
    expect(typeof result.Query.PersonDistinctValues).toBe('function');
    expect(typeof result.Query.PlaceCount).toBe('function');
    expect(typeof result.Query.PlaceDistinctValues).toBe('function');
    expect(typeof result.Query.Person).toBe('function');
    expect(typeof result.Query.Place).toBe('function');
    expect(typeof result.Query.People).toBe('function');
    expect(typeof result.Query.Places).toBe('function');
    expect(typeof result.Mutation.createManyPeople).toBe('function');
    expect(typeof result.Mutation.createManyPlaces).toBe('function');
    expect(typeof result.Mutation.createPerson).toBe('function');
    expect(typeof result.Mutation.createPlace).toBe('function');
    expect(typeof result.Mutation.pushIntoPerson).toBe('function');
    expect(typeof result.Mutation.pushIntoPlace).toBe('undefined');
    expect(typeof result.Mutation.updatePerson).toBe('function');
    expect(typeof result.Mutation.updatePlace).toBe('function');
    expect(typeof result.Mutation.deletePerson).toBe('function');
    expect(typeof result.Mutation.deletePlace).toBe('function');
    expect(typeof result.Person.friends).toBe('function');
    expect(typeof result.Person.enemies).toBe('function');
    expect(typeof result.Person.location).toBe('function');
    expect(typeof result.Person.favoritePlace).toBe('function');
    expect(typeof result.Subscription.createdPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.createdPlace.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedPlace.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedPlace.subscribe).toBe('function');
  });

  test('should create resolvers for two entities with embedded fields', () => {
    const addressConfig: EmbeddedEntityConfig = {
      name: 'Address',
      type: 'embedded',
      textFields: [
        {
          name: 'country',
          required: true,
          default: 'Ukraine',
          type: 'textFields',
        },
        {
          name: 'province',
          type: 'textFields',
        },
      ],
    };
    const personConfig: TangibleEntityConfig = {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
      ],
      embeddedFields: [
        {
          name: 'location',
          config: addressConfig,
          required: true,
          type: 'embeddedFields',
        },
        {
          name: 'locations',
          array: true,
          config: addressConfig,
          required: true,
          type: 'embeddedFields',
          variants: ['plain'],
        },
        {
          name: 'place',
          config: addressConfig,
          type: 'embeddedFields',
        },
        {
          name: 'places',
          array: true,
          config: addressConfig,
          type: 'embeddedFields',
          variants: ['plain'],
        },
      ],
    };
    const allEntityConfigs = { Person: personConfig, Address: addressConfig };
    const generalConfig: GeneralConfig = { allEntityConfigs };

    const { entityTypeDic } = composeGqlTypes(generalConfig);
    const result = composeGqlResolvers(generalConfig, entityTypeDic);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.node).toBe('function');
    expect(typeof result.Query.PersonCount).toBe('function');
    expect(typeof result.Query.PersonDistinctValues).toBe('function');
    expect(typeof result.Query.Person).toBe('function');
    expect(typeof result.Query.People).toBe('function');
    expect(typeof result.Mutation.createManyPeople).toBe('function');
    expect(typeof result.Mutation.createPerson).toBe('function');
    expect(typeof result.Mutation.updatePerson).toBe('function');
    expect(typeof result.Mutation.deletePerson).toBe('function');
    expect(result.Query.Address).toBeUndefined();
    expect(result.Mutation.createAddress).toBeUndefined();
    expect(typeof result.Subscription.createdPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedPerson.subscribe).toBe('function');
  });

  test('should create resolvers for two entities with duplex entities', () => {
    const personConfig = {} as TangibleEntityConfig;
    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
          type: 'duplexFields',
        },
      ],
    });

    const allEntityConfigs = { Person: personConfig, Place: placeConfig };
    const generalConfig: GeneralConfig = { allEntityConfigs };

    const { entityTypeDic } = composeGqlTypes(generalConfig);
    const result = composeGqlResolvers(generalConfig, entityTypeDic);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.node).toBe('function');
    expect(typeof result.Query.PersonCount).toBe('function');
    expect(typeof result.Query.PersonDistinctValues).toBe('function');
    expect(typeof result.Query.PlaceCount).toBe('function');
    expect(typeof result.Query.PlaceDistinctValues).toBe('function');
    expect(typeof result.Query.Person).toBe('function');
    expect(typeof result.Query.Place).toBe('function');
    expect(typeof result.Query.People).toBe('function');
    expect(typeof result.Query.Places).toBe('function');
    expect(typeof result.Mutation.createManyPeople).toBe('function');
    expect(typeof result.Mutation.createPerson).toBe('function');
    expect(typeof result.Mutation.createPlace).toBe('function');
    expect(typeof result.Mutation.pushIntoPerson).toBe('function');
    expect(typeof result.Mutation.pushIntoPlace).toBe('function');
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
    expect(typeof result.Subscription.createdPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.createdPlace.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedPlace.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedPerson.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedPlace.subscribe).toBe('function');
  });

  test('should create resolvers for two entities with geospatial fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'pointField1',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'pointField2',
          required: true,
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'pointField3',
          array: true,
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'pointField4',
          array: true,
          required: true,
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'polygonField1',
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
        {
          name: 'polygonField2',
          required: true,
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
        {
          name: 'polygonField3',
          array: true,
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
        {
          name: 'polygonField4',
          array: true,
          required: true,
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
      ],
    };

    const allEntityConfigs = { Example: entityConfig };
    const generalConfig: GeneralConfig = { allEntityConfigs };

    const { entityTypeDic } = composeGqlTypes(generalConfig);
    const result = composeGqlResolvers(generalConfig, entityTypeDic);

    expect(typeof result.DateTime).toBe('object');
    expect(typeof result.Query.node).toBe('function');
    expect(typeof result.Query.ExampleCount).toBe('function');
    expect(result.Query.ExampleDistinctValues).toBeUndefined();
    expect(typeof result.Query.Example).toBe('function');
    expect(typeof result.Query.Examples).toBe('function');
    expect(typeof result.Mutation.createManyExamples).toBe('function');
    expect(typeof result.Mutation.createExample).toBe('function');
    expect(typeof result.Mutation.pushIntoExample).toBe('function');
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
    expect(typeof result.Subscription.createdExample.subscribe).toBe('function');
    expect(typeof result.Subscription.deletedExample.subscribe).toBe('function');
    expect(typeof result.Subscription.updatedExample.subscribe).toBe('function');
  });

  test('should create resolvers for one entity with inventory for only queries', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
    };
    const allEntityConfigs = { Example: entityConfig };
    const inventory: Inventory = { name: 'test', include: { Query: true } };
    const generalConfig: GeneralConfig = { allEntityConfigs, inventory };

    const { entityTypeDic } = composeGqlTypes(generalConfig);
    const result = composeGqlResolvers(generalConfig, entityTypeDic);

    expect(typeof result.Query.node).toBe('function');
    expect(typeof result.Query.ExampleCount).toBe('function');
    expect(typeof result.Query.ExampleDistinctValues).toBe('function');
    expect(typeof result.Query.Example).toBe('function');
    expect(typeof result.Query.Examples).toBe('function');
    expect(result.Mutation).toBeUndefined();
    expect(result.Subscription).toBeUndefined();
  });

  test('should create resolvers for one entity with inventory for only mutations', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
    };
    const allEntityConfigs = { Example: entityConfig };
    const inventory: Inventory = { name: 'test', include: { Mutation: true } };
    const generalConfig: GeneralConfig = { allEntityConfigs, inventory };

    const { entityTypeDic } = composeGqlTypes(generalConfig);
    const result = composeGqlResolvers(generalConfig, entityTypeDic);

    expect(typeof result.Query.node).toBe('function');
    expect(typeof result.Mutation.createManyExamples).toBe('function');
    expect(typeof result.Mutation.createExample).toBe('function');
    expect(typeof result.Mutation.pushIntoExample).toBe('undefined');
    expect(typeof result.Mutation.updateExample).toBe('function');
    expect(typeof result.Mutation.deleteExample).toBe('function');
    expect(result.Subscription).toBeUndefined();
  });

  test('should create resolvers for one entity with inventory for only entity queries', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
    };
    const allEntityConfigs = { Example: entityConfig };
    const inventory: Inventory = { name: 'test', include: { Query: { entity: true } } };
    const generalConfig: GeneralConfig = { allEntityConfigs, inventory };

    const { entityTypeDic } = composeGqlTypes(generalConfig);
    const result = composeGqlResolvers(generalConfig, entityTypeDic);

    expect(result.Query.ExampleCount).toBeUndefined();
    expect(result.Query.ExampleDistinctValues).toBeUndefined();
    expect(typeof result.Query.node).toBe('function');
    expect(typeof result.Query.Example).toBe('function');
    expect(result.Query.Examples).toBeUndefined();
    expect(result.Mutation).toBeUndefined();
    expect(result.Subscription).toBeUndefined();
  });

  test('should create resolvers for one entity with inventory for only mutations', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
    };
    const allEntityConfigs = { Example: entityConfig };
    const inventory: Inventory = { name: 'test', include: { Mutation: { createEntity: true } } };
    const generalConfig: GeneralConfig = { allEntityConfigs, inventory };

    const { entityTypeDic } = composeGqlTypes(generalConfig);
    const result = composeGqlResolvers(generalConfig, entityTypeDic);

    expect(typeof result.Query.node).toBe('function');
    expect(result.Mutation.createManyExamples).toBeUndefined();
    expect(typeof result.Mutation.createExample).toBe('function');
    expect(result.Mutation.updateExample).toBeUndefined();
    expect(result.Mutation.deleteExample).toBeUndefined();
    expect(result.Subscription).toBeUndefined();
  });

  test('should create resolvers for one entity with inventory for only one custom mutation', async () => {
    const createCustomLoadEntityMutationResolver = () => async () => 'test passed!';
    const signatureMethods: ActionSignatureMethods = {
      name: 'loadEntity',
      specificName: ({ name }: any) => `load${name}`,
      argNames: () => ['path'],
      argTypes: () => ['String!'],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
      type: ({ name }: any) => name,
      config: (entityConfig: any) => entityConfig,
    };

    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
    };

    const allEntityConfigs = { Example: entityConfig };
    const inventory: Inventory = { name: 'test', include: { Mutation: { loadEntity: true } } };
    const custom = { Mutation: { loadEntity: signatureMethods } };
    const generalConfig: GeneralConfig = { allEntityConfigs, custom, inventory };
    const serversideConfig: ServersideConfig = {
      Mutation: { loadEntity: createCustomLoadEntityMutationResolver },
    };

    const { entityTypeDic } = composeGqlTypes(generalConfig);
    const result = composeGqlResolvers(generalConfig, entityTypeDic, serversideConfig);

    expect(typeof result.Query.node).toBe('function');
    expect(result.Mutation.createManyExamples).toBeUndefined();
    expect(result.Mutation.createExample).toBeUndefined();
    expect(result.Mutation.updateExample).toBeUndefined();
    expect(result.Mutation.deleteExample).toBeUndefined();
    expect(result.Subscription).toBeUndefined();
    expect(typeof result.Mutation.loadExample).toBe('function');
    const customMutationResult = await result.Mutation.loadExample(null, {}, {}); // parent, args, context
    expect(customMutationResult).toBe('test passed!');
  });

  test('should create resolvers for one entity with inventory for only one custom Query', async () => {
    const createCustomLoadEntityMutationResolver = () => async () => 'test passed!';
    const signatureMethods: ActionSignatureMethods = {
      name: 'getEntity',
      specificName: ({ name }: any) => `get${name}`,
      argNames: () => ['path'],
      argTypes: () => ['String!'],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
      type: ({ name }: any) => name,
      config: (entityConfig: any) => entityConfig,
    };

    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
    };

    const allEntityConfigs = { Example: entityConfig };
    const inventory: Inventory = { name: 'test', include: { Query: { getEntity: true } } };
    const custom = { Query: { getEntity: signatureMethods } };
    const generalConfig: GeneralConfig = { allEntityConfigs, custom, inventory };
    const serversideConfig: ServersideConfig = {
      Query: { getEntity: createCustomLoadEntityMutationResolver },
    };

    const { entityTypeDic } = composeGqlTypes(generalConfig);
    const result = composeGqlResolvers(generalConfig, entityTypeDic, serversideConfig);

    expect(result.Mutation).toBeUndefined();
    expect(result.Query.ExampleCount).toBeUndefined();
    expect(result.Query.ExampleDistinctValues).toBeUndefined();
    expect(result.Query.Example).toBeUndefined();
    expect(result.Query.Examples).toBeUndefined();
    expect(result.Subscription).toBeUndefined();
    expect(typeof result.Query.node).toBe('function');
    expect(typeof result.Query.getExample).toBe('function');
    const customQueryResult = await result.Query.getExample(null, {}, {}); // parent, args, context
    expect(customQueryResult).toBe('test passed!');
  });
});
