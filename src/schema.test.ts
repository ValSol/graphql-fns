import { makeExecutableSchema } from '@graphql-tools/schema';

import type {
  RepresentationAttributes,
  Enums,
  EntityConfig,
  GeneralConfig,
  Inventory,
  ServersideConfig,
  SimplifiedEntityConfig,
  SimplifiedTangibleEntityConfig,
} from './tsTypes';

import composeTypeDefsAndResolvers from './composeTypeDefsAndResolvers';
import composeAllEntityConfigs from './utils/composeAllEntityConfigs';
import pageInfoConfig from './utils/composeAllEntityConfigs/pageInfoConfig';

describe('graphql schema', () => {
  test('test simple schema', () => {
    const entityConfig: SimplifiedEntityConfig = {
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

    const simplifiedEntityConfigs = [entityConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedEntityConfigs);
    const generalConfig: GeneralConfig = { allEntityConfigs };
    const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  test('test schema with enumerations', () => {
    const entityConfig: SimplifiedEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          unique: true,
        },
        {
          name: 'textField2',
          default: 'default text',
          index: true,
        },
        {
          name: 'textField3',
          required: true,
          index: true,
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
      enumFields: [
        {
          name: 'day',
          enumName: 'Weekdays',
          index: true,
        },
        {
          name: 'cuisines',
          array: true,
          enumName: 'Cuisines',
          required: true,
          index: true,
        },
      ],

      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [entityConfig];
    const enums: Enums = {
      Weekdays: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'],
      Cuisines: ['ukrainian', 'italian', 'georgian', 'japanese', 'chinese'],
    };
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs, enums);

    const generalConfig: GeneralConfig = { allEntityConfigs, enums };
    const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig);

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  test('test schema with embedded fields', () => {
    const addressConfig: SimplifiedEntityConfig = {
      name: 'Address',
      type: 'embedded',
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
    const personConfig: SimplifiedEntityConfig = {
      name: 'Person',
      type: 'tangible',
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
          configName: 'Address',
          required: true,
        },
        {
          name: 'locations',
          array: true,
          configName: 'Address',
          required: true,
        },
        {
          name: 'place',
          configName: 'Address',
        },
        {
          name: 'places',
          array: true,
          configName: 'Address',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [personConfig, addressConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const generalConfig: GeneralConfig = { allEntityConfigs };
    const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig);

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    expect(schema).not.toBeUndefined();
  });

  test('test schema with duplex fields', () => {
    const placeConfig: SimplifiedTangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          configName: 'Person',
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          configName: 'Person',
        },
      ],
    };
    const personConfig: SimplifiedTangibleEntityConfig = {
      name: 'Person',
      type: 'tangible',
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
          configName: 'Person',
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          configName: 'Person',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          configName: 'Place',
          required: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          configName: 'Place',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [personConfig, placeConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const generalConfig: GeneralConfig = { allEntityConfigs };
    const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    expect(schema).not.toBeUndefined();
  });

  describe('test schemas with differnet variants of inventory', () => {
    const placeConfig: SimplifiedEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          configName: 'Person',
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          configName: 'Person',
        },
      ],
    };
    const personConfig: SimplifiedEntityConfig = {
      name: 'Person',
      type: 'tangible',
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
          configName: 'Person',
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          configName: 'Person',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          configName: 'Place',
          required: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          configName: 'Place',
        },
      ],
    };

    const simplifiedAllEntityConfigs = [personConfig, placeConfig];
    const allEntityConfigs = composeAllEntityConfigs(simplifiedAllEntityConfigs);
    const generalConfig: GeneralConfig = { allEntityConfigs };

    test('test schema with only mutations in inventory', () => {
      generalConfig.inventory = {
        name: 'test',
        include: {
          Mutation: true,
          Query: { entity: true, entities: true, childEntity: true, childEntities: true },
        },
      };

      const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig);

      const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });

      expect(schema).not.toBeUndefined();
    });

    test('test schema with only createEntity mutations in inventory', () => {
      generalConfig.inventory = {
        name: 'test',
        include: {
          Mutation: { createEntity: true },
          Query: { childEntity: true, childEntities: true },
        },
      };

      const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig);
      const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });
      expect(schema).not.toBeUndefined();
    });

    test('test schema with only createPerson mutations in inventory', () => {
      generalConfig.inventory = {
        name: 'test',
        include: {
          Mutation: { createEntity: ['Person'] },
          Query: { childEntity: true, childEntities: true },
        },
      };

      const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig);

      const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });
      expect(schema).not.toBeUndefined();
    });

    test('test schema with only quries in inventory', () => {
      generalConfig.inventory = { name: 'test', include: { Query: true } };

      const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig);
      const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });
      expect(schema).not.toBeUndefined();
    });

    test('test schema with only entity query in inventory', () => {
      generalConfig.inventory = {
        name: 'test',
        include: { Query: { entity: true } },
      };

      const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig);

      const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
      });
      expect(schema).not.toBeUndefined();
    });
  });

  test('test schema with representation queries', () => {
    const ForCatalogRepresentation: RepresentationAttributes = {
      allow: { Example: ['entities', 'updateEntity'] },
      representationKey: 'ForCatalog',
      addFields: {
        Example: {
          dateTimeFields: [{ name: 'start', required: true }, { name: 'end' }],
        },
      },
    };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
      ],
    };

    const edgeConfig: EntityConfig = {
      name: 'ExampleEdge',
      type: 'virtual',
      textFields: [
        {
          name: 'cursor',
          required: true,
          type: 'textFields',
        },
      ],
      childFields: [
        {
          name: 'node',
          config: entityConfig,
          type: 'childFields',
        },
      ],
    };

    const allEntityConfigs = {
      Example: entityConfig,
      PageInfo: pageInfoConfig,
      ExampleEdge: edgeConfig,
    };
    const inventory: Inventory = {
      name: 'test',
      include: {
        Query: { entitiesForCatalog: true },
        Mutation: { updateEntityForCatalog: true },
      },
    };

    const representations = { ForCatalog: ForCatalogRepresentation };
    const generalConfig: GeneralConfig = { allEntityConfigs, representations, inventory };

    const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig);

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    expect(schema).not.toBeUndefined();
  });

  describe('inventory consistency of typeDefs and resolvers', () => {
    const simplifiedEntityConfigs: SimplifiedEntityConfig[] = [
      {
        name: 'Menu',
        textFields: [{ name: 'title', index: true }],
        duplexFields: [
          { name: 'sections', array: true, oppositeName: 'menu', configName: 'Section' },
        ],
      },
      {
        name: 'Section',
        textFields: [{ name: 'title', index: true }],
        duplexFields: [{ name: 'menu', oppositeName: 'sections', configName: 'Menu' }],
      },
    ];

    test('should not show scalar child fields excluded by inventory', () => {
      const allEntityConfigs = composeAllEntityConfigs(simplifiedEntityConfigs);

      const inventory: Inventory = {
        name: 'test',
        exclude: { Query: { childEntity: ['Menu'], childEntityGetOrCreate: ['Menu'] } },
      };

      const { typeDefs, resolvers } = composeTypeDefsAndResolvers({ allEntityConfigs, inventory });

      const sectionType = typeDefs.match(/type Section implements[^}]*\}/)?.[0];

      expect(sectionType).not.toMatch(/\n  menu: /);
      expect(sectionType).not.toMatch(/\n  menuGetOrCreate\(/);
      expect(resolvers.Section?.menu).toBeUndefined();
      expect(resolvers.Section?.menuGetOrCreate).toBeUndefined();

      expect(makeExecutableSchema({ typeDefs, resolvers })).not.toBeUndefined();
    });

    test('should create child count & distinct values resolvers allowed by inventory', async () => {
      const allEntityConfigs = composeAllEntityConfigs(simplifiedEntityConfigs);

      const inventory: Inventory = {
        name: 'test',
        include: {
          Query: {
            entities: true,
            childEntities: true,
            childEntityCount: true,
            childEntityDistinctValues: true,
          },
        },
      };

      const { typeDefs, resolvers } = composeTypeDefsAndResolvers({ allEntityConfigs, inventory });

      expect(typeDefs).toMatch(/\n  sectionsCount\(/);
      expect(typeDefs).toMatch(/\n  sectionsDistinctValues\(/);
      expect(typeDefs).not.toMatch(/\n  sectionsThroughConnection\(/);

      const parent = { sections: ['5f1f1f1f1f1f1f1f1f1f1f1f'] };
      const info = { path: {}, fieldName: 'sectionsCount' };

      // resolvers have to fail on missing db connection, not on missing inner resolver
      await expect(
        resolvers.Menu.sectionsCount(parent, {}, { mongooseConn: {} }, info),
      ).rejects.not.toThrow('func is not a function');

      await expect(
        resolvers.Menu.sectionsDistinctValues(
          parent,
          { options: { target: 'title' } },
          { mongooseConn: {} },
          { ...info, fieldName: 'sectionsDistinctValues' },
        ),
      ).rejects.not.toThrow('func is not a function');
    });
  });

  test('should create field resolvers for entities without relational, duplex & geospatial fields (B3)', () => {
    const simplifiedEntityConfigs: SimplifiedEntityConfig[] = [
      { name: 'Item', type: 'embedded', textFields: [{ name: 'labels', array: true }] },
      {
        name: 'Holder',
        textFields: [{ name: 'tags', array: true }],
        embeddedFields: [
          {
            name: 'items',
            array: true,
            nullable: true,
            configName: 'Item',
            variants: ['plain', 'connection', 'count'],
          },
        ],
      },
    ];

    const allEntityConfigs = composeAllEntityConfigs(simplifiedEntityConfigs);

    const { typeDefs, resolvers } = composeTypeDefsAndResolvers({ allEntityConfigs });

    expect(Object.keys(resolvers.Holder).sort()).toEqual(
      ['items', 'itemsCount', 'itemsThroughConnection', 'tags'].sort(),
    );
    expect(Object.keys(resolvers.Item)).toEqual(['labels']);

    const parent = { tags: ['a', 'b', 'c'], items: [{ labels: ['x'] }, { labels: ['y'] }] };

    expect(
      resolvers.Holder.tags(parent, { slice: { begin: 1 } }, {}, { fieldName: 'tags' }),
    ).toEqual(['b', 'c']);
    expect(resolvers.Holder.itemsCount(parent, {}, {}, { fieldName: 'itemsCount' })).toBe(2);
    expect(
      resolvers.Holder.itemsThroughConnection(
        parent,
        { first: 1 },
        {},
        { fieldName: 'itemsThroughConnection' },
      ).edges.map(({ node }) => node),
    ).toEqual([{ labels: ['x'] }]);

    // "items" is nullable
    expect(resolvers.Holder.itemsCount({ items: null }, {}, {}, { fieldName: 'itemsCount' })).toBe(
      0,
    );

    expect(makeExecutableSchema({ typeDefs, resolvers })).not.toBeUndefined();
  });

  test('should ignore calculated virtual fields in "WherePayloadInput" (B5)', () => {
    const simplifiedEntityConfigs: SimplifiedEntityConfig[] = [
      { name: 'Summary', type: 'virtual', textFields: [{ name: 'text' }] },
      {
        name: 'Doc',
        textFields: [{ name: 'title' }],
        calculatedFields: [
          {
            name: 'summary',
            calculatedType: 'virtualFields',
            configName: 'Summary',
          },
        ],
      },
    ];

    const allEntityConfigs = composeAllEntityConfigs(simplifiedEntityConfigs);

    const serversideConfig: ServersideConfig = {
      calculatedFields: {
        Doc: {
          summary: { fieldsToUseNames: ['title'], func: (args, { title }) => ({ text: title }) },
        },
      },
    };

    const { typeDefs, resolvers } = composeTypeDefsAndResolvers(
      { allEntityConfigs },
      serversideConfig,
    );

    const wherePayloadInput = typeDefs.match(/input DocWherePayloadInput \{[^}]*\}/)?.[0];

    expect(wherePayloadInput).toMatch(/\n  title: String\n/);
    expect(wherePayloadInput).not.toMatch(/summary/);
    expect(typeDefs).toMatch(/\n  summary: Summary\n/);

    expect(makeExecutableSchema({ typeDefs, resolvers })).not.toBeUndefined();
  });

  test('should create geospatial types for calculated geospatial fields only (B6)', () => {
    const simplifiedEntityConfigs: SimplifiedEntityConfig[] = [
      {
        name: 'Place',
        textFields: [{ name: 'title' }],
        calculatedFields: [
          {
            name: 'center',
            calculatedType: 'geospatialFields',
            geospatialType: 'Point',
          },
          {
            name: 'area',
            calculatedType: 'geospatialFields',
            geospatialType: 'Polygon',
          },
          {
            name: 'route',
            array: true,
            calculatedType: 'geospatialFields',
            geospatialType: 'Point',
          },
        ],
      },
    ];

    const allEntityConfigs = composeAllEntityConfigs(simplifiedEntityConfigs);

    const serversideConfig: ServersideConfig = {
      calculatedFields: {
        Place: {
          center: { func: () => null },
          area: { func: () => null },
          route: { func: () => [] },
        },
      },
    };

    const { typeDefs, resolvers } = composeTypeDefsAndResolvers(
      { allEntityConfigs },
      serversideConfig,
    );

    expect(typeDefs).toMatch(/\ntype GeospatialPoint \{/);
    expect(typeDefs).toMatch(/\ntype GeospatialPolygon \{/);

    // calculated geospatial values are already in graphql format, so they are not converted
    const center = { lng: 1, lat: 2 };

    expect(resolvers.Place.center({ center }, {}, {}, { fieldName: 'center' })).toBe(center);

    const route = [
      { lng: 1, lat: 2 },
      { lng: 3, lat: 4 },
    ];

    expect(
      resolvers.Place.route({ route }, { slice: { begin: 1 } }, {}, { fieldName: 'route' }),
    ).toEqual([{ lng: 3, lat: 4 }]);

    expect(makeExecutableSchema({ typeDefs, resolvers })).not.toBeUndefined();
  });

  test('should not require parent in "update" input for duplex field with required opposite (B7)', () => {
    const simplifiedEntityConfigs: SimplifiedEntityConfig[] = [
      {
        name: 'Menu',
        textFields: [{ name: 'title' }],
        duplexFields: [
          { name: 'sections', array: true, oppositeName: 'menu', configName: 'Section' },
        ],
      },
      {
        name: 'Section',
        textFields: [{ name: 'title' }],
        duplexFields: [
          { name: 'menu', oppositeName: 'sections', configName: 'Menu', required: true },
        ],
      },
    ];

    const allEntityConfigs = composeAllEntityConfigs(simplifiedEntityConfigs);

    const { typeDefs, resolvers } = composeTypeDefsAndResolvers({ allEntityConfigs });

    const menuUpdateInput = typeDefs.match(/input MenuUpdateInput \{[^}]*\}/)?.[0];
    const sectionCreateThruInput = typeDefs.match(
      /input SectionCreateThru_menu_FieldInput \{[^}]*\}/,
    )?.[0];

    expect(menuUpdateInput).toMatch(
      /\n  sections: SectionCreateOrPushThru_menu_FieldChildrenInput\n/,
    );

    // created sections get "menu" from the menu they are created for, so "menu" is optional
    expect(sectionCreateThruInput).toMatch(/\n  menu: MenuCreateChildInput\n/);

    expect(makeExecutableSchema({ typeDefs, resolvers })).not.toBeUndefined();
  });

  test('should create custom action resolvers only for tangible entities (B14)', () => {
    const getEntity = {
      name: 'getEntity',
      specificName: ({ name }) => `get${name}`,
      argNames: () => [],
      argTypes: () => [],
      involvedEntityNames: ({ name }) => ({ inputOutputEntity: name }),
      type: () => 'String',
      config: () => null,
    };

    const allEntityConfigs = composeAllEntityConfigs([
      { name: 'Item', type: 'embedded', textFields: [{ name: 'title' }] },
      {
        name: 'Example',
        textFields: [{ name: 'title' }],
        embeddedFields: [{ name: 'item', configName: 'Item' }],
      },
    ]);

    const generalConfig: GeneralConfig = { allEntityConfigs, custom: { Query: { getEntity } } };

    const serversideConfig = { Query: { getEntity: () => async () => 'result' } };

    const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, serversideConfig);

    expect(typeDefs).toMatch(/\n  getExample: String\n/);
    expect(typeDefs).not.toMatch(/getItem/);

    expect(resolvers.Query.getExample).toBeDefined();
    expect(resolvers.Query.getItem).toBeUndefined();

    expect(makeExecutableSchema({ typeDefs, resolvers })).not.toBeUndefined();
  });

  test('should allow to set frozen filter field on creation only (Q1)', () => {
    const allEntityConfigs = composeAllEntityConfigs([
      { name: 'Place', textFields: [{ name: 'title', index: true }] },
      {
        name: 'Selection',
        textFields: [{ name: 'title' }],
        filterFields: [{ name: 'places', array: true, configName: 'Place', freeze: true }],
      },
    ]);

    const { typeDefs, resolvers } = composeTypeDefsAndResolvers({ allEntityConfigs });

    const createInput = typeDefs.match(/input SelectionCreateInput \{[^}]*\}/)?.[0];
    const updateInput = typeDefs.match(/input SelectionUpdateInput \{[^}]*\}/)?.[0];

    expect(createInput).toMatch(/\n  places: PlaceWhereInput\n/);
    expect(updateInput).not.toMatch(/places/);

    expect(makeExecutableSchema({ typeDefs, resolvers })).not.toBeUndefined();
  });

  test('should compose distinct values actions only for indexed fields (Q9)', () => {
    const allEntityConfigs = composeAllEntityConfigs([
      { name: 'Tag', textFields: [{ name: 'title' }] },
      { name: 'Place', textFields: [{ name: 'title', index: true }, { name: 'description' }] },
      {
        name: 'Post',
        textFields: [{ name: 'title' }],
        relationalFields: [
          { name: 'tags', array: true, oppositeName: 'posts', configName: 'Tag' },
          { name: 'places', array: true, oppositeName: 'placePosts', configName: 'Place' },
        ],
      },
    ]);

    const { typeDefs, resolvers } = composeTypeDefsAndResolvers({ allEntityConfigs });

    // "Tag" has no indexed text or enum fields
    expect(typeDefs).not.toMatch(/TagDistinctValues/);
    expect(typeDefs).not.toMatch(/tagsDistinctValues/);
    expect(resolvers.Query.TagDistinctValues).toBeUndefined();
    expect(resolvers.Post.tagsDistinctValues).toBeUndefined();
    expect(typeDefs).not.toMatch(/TagManyDistinctValues/);
    expect(typeDefs).not.toMatch(/TagRestrictedWhereAndTargetInput/);
    expect(resolvers.Query.TagManyDistinctValues).toBeUndefined();

    // "Place" has indexed "title" only
    expect(typeDefs).toMatch(/\nenum PlaceTextNamesEnum \{\n  title\n\}/);
    expect(typeDefs).toMatch(/\n  PlaceDistinctValues\(/);
    expect(typeDefs).toMatch(
      /\n  placesDistinctValues\(where: PlaceWhereInput, options: PlaceDistinctValuesOptionsInput!\)/,
    );
    expect(resolvers.Post.placesDistinctValues).toBeDefined();

    // the same enum is the target of "PlaceManyDistinctValues" (defined once)
    expect(typeDefs.match(/\nenum PlaceTextNamesEnum \{/g)).toHaveLength(1);
    expect(typeDefs).toMatch(
      /\n  PlaceManyDistinctValues\(where: PlaceWhereInput, restrictedWhereAndTarget: \[PlaceRestrictedWhereAndTargetInput!\]!, token: String\): \[\[String!\]!\]!\n/,
    );
    expect(typeDefs).toMatch(
      /\ninput PlaceRestrictedWhereAndTargetInput \{\n  target: PlaceTextNamesEnum!\n  where: PlaceRestrictedWhereInput\n\}/,
    );
    expect(resolvers.Query.PlaceManyDistinctValues).toBeDefined();

    expect(makeExecutableSchema({ typeDefs, resolvers })).not.toBeUndefined();
  });

  test('should compose "…WithChildren" mutations only for "parent" duplex fields (B20)', () => {
    const composeConfigs = (parent: boolean): SimplifiedEntityConfig[] => [
      {
        name: 'Menu',
        textFields: [{ name: 'title' }],
        duplexFields: [
          { name: 'sections', array: true, oppositeName: 'menu', configName: 'Section', parent },
        ],
      },
      {
        name: 'Section',
        textFields: [{ name: 'title' }],
        duplexFields: [{ name: 'menu', oppositeName: 'sections', configName: 'Menu' }],
      },
    ];

    const { typeDefs: typeDefsWithoutParent } = composeTypeDefsAndResolvers({
      allEntityConfigs: composeAllEntityConfigs(composeConfigs(false)),
    });

    expect(typeDefsWithoutParent).not.toMatch(/WithChildren/);

    const { typeDefs, resolvers } = composeTypeDefsAndResolvers({
      allEntityConfigs: composeAllEntityConfigs(composeConfigs(true)),
    });

    expect(typeDefs).toMatch(/\n  deleteMenuWithChildren\(/);
    expect(typeDefs).toMatch(/\nenum deleteMenuWithChildrenOptionsEnum \{\n  sections\n\}/);
    expect(resolvers.Mutation.deleteMenuWithChildren).toBeDefined();

    expect(makeExecutableSchema({ typeDefs, resolvers })).not.toBeUndefined();
  });

  test('should compose renamed & optional args of "copy…" mutations (Q6, B18)', () => {
    const allEntityConfigs = composeAllEntityConfigs([
      {
        name: 'MenuTemplate',
        textFields: [{ name: 'title' }],
        duplexFields: [
          { name: 'menus', array: true, oppositeName: 'original', configName: 'Menu' },
        ],
      },
      {
        name: 'Menu',
        textFields: [{ name: 'title' }],
        duplexFields: [
          { name: 'original', oppositeName: 'menus', configName: 'MenuTemplate' },
          {
            name: 'sections',
            array: true,
            parent: true,
            oppositeName: 'menu',
            configName: 'Section',
          },
        ],
      },
      {
        name: 'Section',
        textFields: [{ name: 'title' }],
        duplexFields: [{ name: 'menu', oppositeName: 'sections', configName: 'Menu' }],
      },
    ]);

    const { typeDefs, resolvers } = composeTypeDefsAndResolvers({ allEntityConfigs });

    expect(typeDefs).toMatch(
      /\n  copyMenu\(whereKeyToSource: MenuWhereKeyToSourceInput!, options: copyMenuOptionsInput, whereTarget: MenuWhereOneInput, data: MenuUpdateInput, token: String\): Menu!\n/,
    );
    expect(typeDefs).toMatch(
      /\n  copyManyMenusWithChildren\(sourceAndTarget: \[MenuCopySourceAndTargetInput!\]!, options: copyMenuOptionsInput, token: String\): \[Menu!\]!\n/,
    );
    expect(typeDefs).toMatch(
      /\ninput MenuCopySourceAndTargetInput \{\n  whereKeyToSource: MenuWhereKeyToSourceInput!\n  whereTarget: MenuWhereOneInput\n\}/,
    );
    expect(typeDefs).toMatch(
      /\ninput MenuWhereKeyToSourceInput \{\n  original: MenuTemplateWhereOneInput\n/,
    );
    expect(typeDefs).toMatch(/\ninput MenuWhereOneInput \{\n  id: ID!\n\}/);
    expect(typeDefs).not.toMatch(/whereOnes|CopyWhereOnesInput|WhereOneToCopyInput/);

    expect(makeExecutableSchema({ typeDefs, resolvers })).not.toBeUndefined();
  });

  test('should reject the renamed "representation" attribute of generalConfig', () => {
    const allEntityConfigs = composeAllEntityConfigs([
      { name: 'Example', textFields: [{ name: 'text' }] },
    ]);

    expect(() =>
      composeTypeDefsAndResolvers({ allEntityConfigs, representation: {} } as GeneralConfig),
    ).toThrow('The "representation" attribute of generalConfig is renamed to "representations"!');
  });
});
