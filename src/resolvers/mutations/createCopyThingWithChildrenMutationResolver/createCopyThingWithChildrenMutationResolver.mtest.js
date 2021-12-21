// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateThingMutationResolver,
} = require('../createCreateThingMutationResolver');
// const {
//   default: createUpdateThingMutationResolver,
// } = require('../createUpdateThingMutationResolver');
const { default: createCopyThingWithChildrenMutationResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-copy-thing-with-children-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
  pubsub = new PubSub();
});

describe('createCopyThingWithChildrenMutationResolver', () => {
  const menuCloneConfig: ThingConfig = {};
  const menuSectionConfig: ThingConfig = {};
  const menuCloneSectionConfig: ThingConfig = {};
  const menuConfig: ThingConfig = {
    name: 'Menu',

    textFields: [
      {
        name: 'name',
        required: true,
      },
    ],

    duplexFields: [
      {
        name: 'clone',
        oppositeName: 'original',
        config: menuCloneConfig,
        parent: true,
      },

      {
        name: 'sections',
        oppositeName: 'menu',
        array: true,
        config: menuSectionConfig,
        parent: true,
      },
    ],
  };

  Object.assign(menuCloneConfig, {
    name: 'MenuClone',

    textFields: [
      {
        name: 'name',
        required: true,
      },
    ],

    duplexFields: [
      {
        name: 'original',
        oppositeName: 'clone',
        config: menuConfig,
      },

      {
        name: 'sections',
        oppositeName: 'menu',
        array: true,
        config: menuCloneSectionConfig,
        parent: true,
      },
    ],
  });

  Object.assign(menuSectionConfig, {
    name: 'MenuSection',

    textFields: [
      {
        name: 'name',
        required: true,
      },
    ],

    duplexFields: [
      {
        name: 'menu',
        oppositeName: 'sections',
        config: menuConfig,
      },
    ],
  });

  Object.assign(menuCloneSectionConfig, {
    name: 'MenuCloneSection',

    textFields: [
      {
        name: 'name',
        required: true,
      },
    ],

    duplexFields: [
      {
        name: 'menu',
        oppositeName: 'sections',
        config: menuCloneConfig,
      },
    ],
  });

  const thingConfigs = {
    Menu: menuConfig,
    MenuClone: menuCloneConfig,
    MenuSection: menuSectionConfig,
    MenuCloneSection: menuCloneSectionConfig,
  };

  const generalConfig: GeneralConfig = { thingConfigs };
  const serversideConfig = { transactions: true };

  test('should create mutation add thing resolver', async () => {
    const menuSchema = createThingSchema(menuConfig);
    const Menu = mongooseConn.model('Menu_Thing', menuSchema);
    await Menu.createCollection();

    const menuSectionSchema = createThingSchema(menuSectionConfig);
    const MenuSection = mongooseConn.model('MenuSection_Thing', menuSectionSchema);
    await MenuSection.createCollection();

    const menuCloneSchema = createThingSchema(menuCloneConfig);
    const MenuClone = mongooseConn.model('MenuClone_Thing', menuCloneSchema);
    await MenuClone.createCollection();

    const createMenu = createCreateThingMutationResolver(
      menuConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createMenu).toBe('function');
    if (!createMenu) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      name: 'Menu Name',
      sections: {
        create: [
          { name: 'Section Name 1' },
          { name: 'Section Name 2' },
          { name: 'Section Name 3' },
        ],
      },
    };

    const createdMenu = await createMenu(null, { data }, { mongooseConn, pubsub });
    expect(createdMenu.name).toBe(data.name);
    expect(createdMenu.sections.length).toBe(3);

    const copyMenuCloneWithChildren = createCopyThingWithChildrenMutationResolver(
      menuCloneConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof copyMenuCloneWithChildren).toBe('function');
    if (!copyMenuCloneWithChildren) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const personClone = await copyMenuCloneWithChildren(
      null,
      {
        whereOnes: { original: { id: createdMenu.id } },
      },
      { mongooseConn, pubsub },
    );
    expect(personClone.name).toBe(data.name);
    expect(personClone.sections.length).toBe(3);
    expect(personClone.original.toString()).toBe(createdMenu.id.toString());
  });
});
