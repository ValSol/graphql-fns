/* eslint-env jest */
import type { GeneralConfig, TangibleEntityConfig } from '../../../tsTypes';

import mongoose from 'mongoose';
import { PubSub } from 'graphql-subscriptions';

import mongoOptions from '../../../../test/mongo-options';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import createCreateEntityMutationResolver from '../createCreateEntityMutationResolver';
import createDeleteFilteredEntitiesWithChildrenMutationResolver from './index';

const info = {
  projection: {
    title: 1,
  },
};

mongoose.set('strictQuery', false);

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-delete-filtered-entities-with-children-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createDeleteFilteredEntitiesWithChildrenMutationResolver', () => {
  const menuConfig = {} as TangibleEntityConfig;
  const menuCloneConfig = {} as TangibleEntityConfig;
  const menuSectionConfig = {} as TangibleEntityConfig;
  const menuSectionCloneConfig = {} as TangibleEntityConfig;
  const postConfig = {} as TangibleEntityConfig;
  const postCloneConfig = {} as TangibleEntityConfig;
  const restaurantCloneConfig = {} as TangibleEntityConfig;

  const restaurantConfig: TangibleEntityConfig = {
    name: 'Restaurant',
    type: 'tangible',
    textFields: [{ name: 'title', unique: true, type: 'textFields' }],
    duplexFields: [
      {
        name: 'menu',
        oppositeName: 'restaurant',
        config: menuConfig,
        parent: true,
        type: 'duplexFields',
      },
      {
        name: 'posts',
        oppositeName: 'restaurants',
        array: true,
        config: postConfig,
        type: 'duplexFields',
      },
      {
        name: 'clone',
        oppositeName: 'original',
        config: restaurantCloneConfig,
        parent: true,
        type: 'duplexFields',
      },
    ],
  };

  Object.assign(restaurantCloneConfig, {
    name: 'RestaurantClone',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        required: true,
        type: 'textFields',
      },
    ],
    duplexFields: [
      {
        name: 'original',
        oppositeName: 'clone',
        config: restaurantConfig,
        type: 'duplexFields',
      },
    ],
  });

  Object.assign(menuConfig, {
    name: 'Menu',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        required: true,
        type: 'textFields',
      },
    ],
    duplexFields: [
      {
        name: 'restaurant',
        oppositeName: 'menu',
        config: restaurantConfig,
        type: 'duplexFields',
      },
      {
        name: 'sections',
        oppositeName: 'menu',
        config: menuSectionConfig,
        array: true,
        parent: true,
        type: 'duplexFields',
      },
      {
        name: 'clone',
        oppositeName: 'original',
        config: menuCloneConfig,
        parent: true,
        type: 'duplexFields',
      },
    ],
  });

  Object.assign(menuCloneConfig, {
    name: 'MenuClone',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        required: true,
        type: 'textFields',
      },
    ],
    duplexFields: [
      {
        name: 'original',
        oppositeName: 'clone',
        config: menuConfig,
        type: 'duplexFields',
      },
      {
        name: 'sections',
        oppositeName: 'menu',
        config: menuSectionCloneConfig,
        array: true,
        parent: true,
        type: 'duplexFields',
      },
    ],
  });

  Object.assign(menuSectionConfig, {
    name: 'MenuSection',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        required: true,
        type: 'textFields',
      },
    ],
    duplexFields: [
      {
        name: 'menu',
        oppositeName: 'sections',
        config: menuConfig,
        type: 'duplexFields',
      },
    ],
  });

  Object.assign(menuSectionCloneConfig, {
    name: 'MenuSectionClone',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        required: true,
        type: 'textFields',
      },
    ],
    duplexFields: [
      {
        name: 'menu',
        oppositeName: 'sections',
        config: menuCloneConfig,
        type: 'duplexFields',
      },
    ],
  });

  Object.assign(postConfig, {
    name: 'Post',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        required: true,
        type: 'textFields',
      },
    ],
    duplexFields: [
      {
        name: 'restaurants',
        oppositeName: 'posts',
        config: restaurantConfig,
        array: true,
        type: 'duplexFields',
      },
      {
        name: 'clone',
        oppositeName: 'original',
        config: postCloneConfig,
        parent: true,
        type: 'duplexFields',
      },
    ],
  });

  Object.assign(postCloneConfig, {
    name: 'PostClone',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        required: true,
        type: 'textFields',
      },
    ],
    duplexFields: [
      {
        name: 'original',
        oppositeName: 'clone',
        config: postConfig,
        type: 'duplexFields',
      },
    ],
  });

  const generalConfig: GeneralConfig = {
    allEntityConfigs: {
      Restaurant: restaurantConfig,
      RestaurantClone: restaurantCloneConfig,
      Menu: menuConfig,
      MenuClone: menuCloneConfig,
      MenuSection: menuSectionConfig,
      MenuSectionClone: menuSectionCloneConfig,
      Post: postConfig,
      PostClone: postCloneConfig,
    },
  };

  const data = {
    title: 'Oduvanchik',
    clone: {
      create: { title: 'Oduvanchik - clone' },
    },
    menu: {
      create: {
        title: 'main menu',
        sections: {
          create: [{ title: 'section-1' }, { title: 'section-2' }, { title: 'section-3' }],
        },

        clone: {
          create: {
            title: 'main menu - clone',
            sections: {
              create: [{ title: 'section-1 - clone' }, { title: 'section-2 - clone' }],
            },
          },
        },
      },
    },
    posts: {
      create: [
        { title: 'post1', clone: { create: { title: 'post1 - clone' } } },
        { title: 'post2', clone: { create: { title: 'post2 - clone' } } },
        { title: 'post3', clone: { create: { title: 'post3 - clone' } } },
      ],
    },
  };

  test('should delete all children of Restaurant', async () => {
    let schema = createThingSchema(restaurantConfig);
    const Restaurant = mongooseConn.model('Restaurant_Thing', schema);
    await Restaurant.createCollection();

    schema = createThingSchema(restaurantCloneConfig);
    const RestaurantClone = mongooseConn.model('RestaurantClone_Thing', schema);
    await RestaurantClone.createCollection();

    schema = createThingSchema(menuConfig);
    const Menu = mongooseConn.model('Menu_Thing', schema);
    await Menu.createCollection();

    schema = createThingSchema(menuCloneConfig);
    const MenuClone = mongooseConn.model('MenuClone_Thing', schema);
    await MenuClone.createCollection();

    schema = createThingSchema(menuSectionConfig);
    const MenuSection = mongooseConn.model('MenuSection_Thing', schema);
    await MenuSection.createCollection();

    schema = createThingSchema(menuSectionCloneConfig);
    const menuSectionClone = mongooseConn.model('MenuSectionClone_Thing', schema);
    await menuSectionClone.createCollection();

    schema = createThingSchema(postConfig);
    const Post = mongooseConn.model('Post_Thing', schema);
    await Post.createCollection();

    schema = createThingSchema(postCloneConfig);
    const PostClone = mongooseConn.model('PostClone_Thing', schema);
    await PostClone.createCollection();

    const serversideConfig = { transactions: true };
    const createRestaurant = createCreateEntityMutationResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof createRestaurant).toBe('function');
    if (!createRestaurant) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const createdRestaurant = await createRestaurant(
      null,
      { data },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [[]] },
    );

    expect(createdRestaurant.title).toBe(data.title);

    const {
      id: restaurantId,
      menu: menuId,
      posts: postsIds,
      clone: restaurantCloneId,
    } = createdRestaurant;

    const createdRestaurantClone = await RestaurantClone.findById(restaurantCloneId);

    expect(createdRestaurantClone.title).toBe(data.clone.create.title);

    const createdMenu = await Menu.findById(menuId);

    expect(createdMenu.title).toBe(data.menu.create.title);

    const { sections: menuSections, clone: menuCloneId } = createdMenu;

    const sections = await MenuSection.find({ _id: { $in: menuSections } });

    expect(sections.length).toBe(data.menu.create.sections.create.length);

    sections.forEach(({ title }, i) => {
      expect(title).toBe(data.menu.create.sections.create[i].title);
    });

    const createdMenuClone = await MenuClone.findById(menuCloneId);

    expect(createdMenuClone.title).toBe(data.menu.create.clone.create.title);

    const { sections: menuCloneSections } = createdMenuClone;

    const sectionClones = await menuSectionClone.find({ _id: { $in: menuCloneSections } });

    sectionClones.forEach(({ title }, i) => {
      expect(title).toBe(data.menu.create.clone.create.sections.create[i].title);
    });

    const posts = await Post.find({ _id: { $in: postsIds } });

    posts.forEach(({ title }, i) => {
      expect(title).toBe(data.posts.create[i].title);
    });

    const postClones = await Post.find({});

    expect(posts.length).toBe(postClones.length);

    const deleteRestaurant = createDeleteFilteredEntitiesWithChildrenMutationResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );
    if (!deleteRestaurant) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const [restaurantDeleted] = await deleteRestaurant(
      null,
      { where: { id_in: [restaurantId.toString()] } },
      { mongooseConn, pubsub },
      info,
      { inputOutputEntity: [[]] },
    );

    expect(restaurantDeleted.title).toBe(data.title);

    const deletedRestaurant = await Restaurant.findById(restaurantId);

    expect(deletedRestaurant).toBeNull();

    const delatedRestaurantClone = await RestaurantClone.findById(restaurantCloneId);

    expect(delatedRestaurantClone).toBeNull();

    const deletedMenu = await Menu.findById(menuId);

    expect(deletedMenu).toBeNull();

    const deletedSections = await MenuSection.find({ _id: { $in: menuSections } });

    expect(deletedSections.length).toBe(0);

    const delatedMenuClone = await MenuClone.findById(menuCloneId);

    expect(delatedMenuClone).toBeNull();

    const deletedSectionClones = await menuSectionClone.find({ _id: { $in: menuCloneSections } });

    expect(deletedSectionClones.length).toBe(0);

    const posts2 = await Post.find({ _id: { $in: postsIds } });

    posts2.forEach(({ title }, i) => {
      expect(title).toBe(data.posts.create[i].title);
    });

    const postClones2 = await Post.find();
    expect(posts2.length).toBe(postClones2.length);

    await Post.deleteMany({});
    await PostClone.deleteMany({});
  });

  test('should delete all children of MenuClone', async () => {
    let schema = createThingSchema(restaurantConfig);
    const Restaurant = mongooseConn.model('Restaurant_Thing', schema);

    schema = createThingSchema(restaurantCloneConfig);
    const RestaurantClone = mongooseConn.model('RestaurantClone_Thing', schema);

    schema = createThingSchema(menuConfig);
    const Menu = mongooseConn.model('Menu_Thing', schema);

    schema = createThingSchema(menuCloneConfig);
    const MenuClone = mongooseConn.model('MenuClone_Thing', schema);

    schema = createThingSchema(menuSectionConfig);
    const MenuSection = mongooseConn.model('MenuSection_Thing', schema);

    schema = createThingSchema(menuSectionCloneConfig);
    const menuSectionClone = mongooseConn.model('MenuSectionClone_Thing', schema);

    schema = createThingSchema(postConfig);
    const Post = mongooseConn.model('Post_Thing', schema);

    schema = createThingSchema(postCloneConfig);
    const PostClone = mongooseConn.model('PostClone_Thing', schema);

    const serversideConfig = { transactions: true };
    const createRestaurant = createCreateEntityMutationResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof createRestaurant).toBe('function');
    if (!createRestaurant) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const createdRestaurant = await createRestaurant(
      null,
      { data },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [[]] },
    );

    expect(createdRestaurant.title).toBe(data.title);

    const {
      id: restaurantId,
      menu: menuId,
      posts: postsIds,
      clone: restaurantCloneId,
    } = createdRestaurant;

    const createdRestaurantClone = await RestaurantClone.findById(restaurantCloneId);

    expect(createdRestaurantClone.title).toBe(data.clone.create.title);

    const createdMenu = await Menu.findById(menuId);

    expect(createdMenu.title).toBe(data.menu.create.title);

    const { sections: menuSections, clone: menuCloneId } = createdMenu;

    const sections = await MenuSection.find({ _id: { $in: menuSections } });

    expect(sections.length).toBe(data.menu.create.sections.create.length);

    sections.forEach(({ title }, i) => {
      expect(title).toBe(data.menu.create.sections.create[i].title);
    });

    const createdMenuClone = await MenuClone.findById(menuCloneId);

    expect(createdMenuClone.title).toBe(data.menu.create.clone.create.title);

    const { sections: menuCloneSections } = createdMenuClone;

    const sectionClones = await menuSectionClone.find({ _id: { $in: menuCloneSections } });

    sectionClones.forEach(({ title }, i) => {
      expect(title).toBe(data.menu.create.clone.create.sections.create[i].title);
    });

    const posts = await Post.find({ _id: { $in: postsIds } });

    posts.forEach(({ title }, i) => {
      expect(title).toBe(data.posts.create[i].title);
    });

    const postClones = await Post.find({});

    expect(posts.length).toBe(postClones.length);

    const deleteMenuClone = createDeleteFilteredEntitiesWithChildrenMutationResolver(
      menuCloneConfig,
      generalConfig,
      serversideConfig,
    );
    if (!deleteMenuClone) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const [menuCloneDeleted] = await deleteMenuClone(
      null,
      { where: { id_in: [menuCloneId.toString()] } },
      { mongooseConn, pubsub },
      info,
      { inputOutputEntity: [[]] },
    );

    expect(menuCloneDeleted.title).toBe(data.menu.create.clone.create.title);

    const createdRestaurant2 = await Restaurant.findById(restaurantId);

    expect(createdRestaurant2.title).toBe(data.title);

    const createdRestaurantClone2 = await RestaurantClone.findById(restaurantCloneId);

    expect(createdRestaurantClone2.title).toBe(data.clone.create.title);

    const createdMenu2 = await Menu.findById(menuId);

    expect(createdMenu2.title).toBe(data.menu.create.title);

    const createdSections = await MenuSection.find({ _id: { $in: menuSections } });

    expect(createdSections.length).toBe(data.menu.create.sections.create.length);

    const delatedMenuClone = await MenuClone.findById(menuCloneId);

    expect(delatedMenuClone).toBeNull();

    const deletedSectionClones = await menuSectionClone.find({ _id: { $in: menuCloneSections } });

    expect(deletedSectionClones.length).toBe(0);

    const posts2 = await Post.find({ _id: { $in: postsIds } });

    posts2.forEach(({ title }, i) => {
      expect(title).toBe(data.posts.create[i].title);
    });

    const postClones2 = await Post.find();
    expect(posts2.length).toBe(postClones2.length);

    await Post.deleteMany({});
    await PostClone.deleteMany({});

    const deleteRestaurant = createDeleteFilteredEntitiesWithChildrenMutationResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );
    if (!deleteRestaurant) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    await deleteRestaurant(
      null,
      { where: { id_in: [restaurantId.toString()] } },
      { mongooseConn, pubsub },
      info,
      { inputOutputEntity: [[]] },
    );
  });

  test('should delete some children of Restauarnt', async () => {
    let schema = createThingSchema(restaurantConfig);
    const Restaurant = mongooseConn.model('Restaurant_Thing', schema);

    schema = createThingSchema(restaurantCloneConfig);
    const RestaurantClone = mongooseConn.model('RestaurantClone_Thing', schema);

    schema = createThingSchema(menuConfig);
    const Menu = mongooseConn.model('Menu_Thing', schema);

    schema = createThingSchema(menuCloneConfig);
    const MenuClone = mongooseConn.model('MenuClone_Thing', schema);

    schema = createThingSchema(menuSectionConfig);
    const MenuSection = mongooseConn.model('MenuSection_Thing', schema);

    schema = createThingSchema(menuSectionCloneConfig);
    const menuSectionClone = mongooseConn.model('MenuSectionClone_Thing', schema);

    schema = createThingSchema(postConfig);
    const Post = mongooseConn.model('Post_Thing', schema);

    schema = createThingSchema(postCloneConfig);
    const PostClone = mongooseConn.model('PostClone_Thing', schema);

    const serversideConfig = { transactions: true };
    const createRestaurant = createCreateEntityMutationResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof createRestaurant).toBe('function');
    if (!createRestaurant) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const createdRestaurant = await createRestaurant(
      null,
      { data },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [[]] },
    );

    expect(createdRestaurant.title).toBe(data.title);

    const {
      id: restaurantId,
      menu: menuId,
      posts: postsIds,
      clone: restaurantCloneId,
    } = createdRestaurant;

    const createdRestaurantClone = await RestaurantClone.findById(restaurantCloneId);

    expect(createdRestaurantClone.title).toBe(data.clone.create.title);

    const createdMenu = await Menu.findById(menuId);

    expect(createdMenu.title).toBe(data.menu.create.title);

    const { sections: menuSections, clone: menuCloneId } = createdMenu;

    const sections = await MenuSection.find({ _id: { $in: menuSections } });

    expect(sections.length).toBe(data.menu.create.sections.create.length);

    sections.forEach(({ title }, i) => {
      expect(title).toBe(data.menu.create.sections.create[i].title);
    });

    const createdMenuClone = await MenuClone.findById(menuCloneId);

    expect(createdMenuClone.title).toBe(data.menu.create.clone.create.title);

    const { sections: menuCloneSections } = createdMenuClone;

    const sectionClones = await menuSectionClone.find({ _id: { $in: menuCloneSections } });

    sectionClones.forEach(({ title }, i) => {
      expect(title).toBe(data.menu.create.clone.create.sections.create[i].title);
    });

    const posts = await Post.find({ _id: { $in: postsIds } });

    posts.forEach(({ title }, i) => {
      expect(title).toBe(data.posts.create[i].title);
    });

    const postClones = await Post.find({});

    expect(posts.length).toBe(postClones.length);

    const deleteRestaurant = createDeleteFilteredEntitiesWithChildrenMutationResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );
    if (!deleteRestaurant) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const [restaurantDeleted] = await deleteRestaurant(
      null,
      { where: { id_in: [restaurantId.toString()] }, options: { fieldsToDelete: ['menu'] } },
      { mongooseConn, pubsub },
      info,
      { inputOutputEntity: [[]] },
    );

    expect(restaurantDeleted.title).toBe(restaurantDeleted.title);

    const delatedRestaurant = await Restaurant.findById(restaurantId);

    expect(delatedRestaurant).toBeNull();

    const createdRestaurantClone2 = await RestaurantClone.findById(restaurantCloneId);

    expect(createdRestaurantClone2.title).toBe(data.clone.create.title);

    const delatedMenu = await Menu.findById(menuId);

    expect(delatedMenu).toBeNull();

    const createdSections = await MenuSection.find({ _id: { $in: menuSections } });

    expect(createdSections.length).toBe(0);

    const delatedMenuClone = await MenuClone.findById(menuCloneId);

    expect(delatedMenuClone).toBeNull();

    const deletedSectionClones = await menuSectionClone.find({ _id: { $in: menuCloneSections } });

    expect(deletedSectionClones.length).toBe(0);

    const posts2 = await Post.find({ _id: { $in: postsIds } });

    posts2.forEach(({ title }, i) => {
      expect(title).toBe(data.posts.create[i].title);
    });

    const postClones2 = await Post.find();
    expect(posts2.length).toBe(postClones2.length);

    await Post.deleteMany({});
    await PostClone.deleteMany({});
  });
});
