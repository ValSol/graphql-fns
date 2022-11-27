// @flow
/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateEntityMutationResolver,
} = require('../createCreateEntityMutationResolver');
const {
  default: createUpdateEntityMutationResolver,
} = require('../createUpdateEntityMutationResolver');
const { default: createCopyEntityMutationResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-copy-entity-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createCopyEntityMutationResolver', () => {
  const generalConfig: GeneralConfig = { entityConfigs: {} };
  const serversideConfig = { transactions: true };

  test('should create mutation add entity resolver', async () => {
    const personConfig: EntityConfig = {};
    const personBackupConfig: EntityConfig = {};
    const personCloneConfig: EntityConfig = {};

    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
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
          name: 'clone',
          oppositeName: 'original',
          config: personCloneConfig,
        },
        {
          name: 'backups',
          oppositeName: 'original',
          config: personBackupConfig,
          array: true,
        },
      ],
    });

    Object.assign(personCloneConfig, {
      name: 'PersonClone',
      type: 'tangible',

      textFields: [
        {
          name: 'firstName',
          required: true,
        },

        {
          name: 'lastName',
        },
      ],

      duplexFields: [
        {
          name: 'original',
          oppositeName: 'clone',
          config: personConfig,
          required: true,
        },
      ],
    });

    Object.assign(personBackupConfig, {
      name: 'PersonBackup',
      type: 'tangible',

      textFields: [
        {
          name: 'firstName',
          required: true,
        },

        {
          name: 'lastName',
        },
      ],

      duplexFields: [
        {
          name: 'original',
          oppositeName: 'backups',
          config: personConfig,
          required: true,
        },
      ],
    });
    const personSchema = createThingSchema(personConfig);
    const Person = mongooseConn.model('Person_Thing', personSchema);
    await Person.createCollection();

    const personCloneSchema = createThingSchema(personCloneConfig);
    const PersonClone = mongooseConn.model('PersonClone_Thing', personCloneSchema);
    await PersonClone.createCollection();

    const createPerson = createCreateEntityMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPerson).toBe('function');
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = { firstName: 'Hugo', lastName: 'Boss' };

    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub });
    expect(createdPerson.firstName).toBe(data.firstName);
    expect(createdPerson.lastName).toBe(data.lastName);

    const copyPersonClone = createCopyEntityMutationResolver(
      personCloneConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof copyPersonClone).toBe('function');
    if (!copyPersonClone) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const personClone = await copyPersonClone(
      null,
      {
        whereOnes: { original: { id: createdPerson.id } },
        options: { original: { fieldsToCopy: ['firstName'] } },
      },
      { mongooseConn, pubsub },
    );
    expect(personClone.firstName).toBe(data.firstName);
    expect(personClone.lastName).toBe(undefined);
    expect(personClone.original.toString()).toBe(createdPerson.id.toString());

    const copyPersonBackup = createCopyEntityMutationResolver(
      personBackupConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof copyPersonBackup).toBe('function');
    if (!copyPersonBackup) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const personBackup = await copyPersonBackup(
      null,
      { whereOnes: { original: { id: createdPerson.id } } },
      { mongooseConn, pubsub },
    );
    expect(personBackup.firstName).toBe(data.firstName);
    expect(personBackup.lastName).toBe(data.lastName);
    expect(personBackup.original.toString()).toBe(createdPerson.id.toString());

    const updatePerson = createUpdateEntityMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof updatePerson).toBe('function');
    if (!updatePerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data2 = { firstName: 'Vasya', lastName: 'Puplkin' };

    const updatedPerson = await updatePerson(
      null,
      { whereOne: { id: createdPerson.id }, data: data2 },
      { mongooseConn, pubsub },
    );
    expect(updatedPerson.firstName).toBe(data2.firstName);
    expect(updatedPerson.lastName).toBe(data2.lastName);

    const personClone2 = await copyPersonClone(
      null,
      { whereOnes: { original: { id: createdPerson.id } } },
      { mongooseConn, pubsub },
    );
    expect(personClone2.firstName).toBe(data2.firstName);
    expect(personClone2.lastName).toBe(data2.lastName);
    expect(personClone2.original.toString()).toBe(createdPerson.id.toString());
    expect(personClone2.id.toString()).toBe(personClone.id.toString());

    const personBackup2 = await copyPersonBackup(
      null,
      { whereOnes: { original: { id: createdPerson.id } } },
      { mongooseConn, pubsub },
    );
    expect(personBackup2.firstName).toBe(data2.firstName);
    expect(personBackup2.lastName).toBe(data2.lastName);

    const data3 = { firstName: 'John', lastName: null };

    const updatedPerson2 = await updatePerson(
      null,
      { whereOne: { id: createdPerson.id }, data: data3 },
      { mongooseConn, pubsub },
    );
    expect(updatedPerson2.firstName).toBe(data3.firstName);
    expect(updatedPerson2.lastName).toBe(undefined);

    const personBackup3 = await copyPersonBackup(
      null,
      {
        whereOnes: { original: { id: createdPerson.id } },
        whereOne: { id: personBackup2.id.toString() },
      },
      { mongooseConn, pubsub },
    );
    expect(personBackup3.firstName).toBe(data3.firstName);
    expect(personBackup3.lastName).toBe(undefined);
    expect(personBackup3.id.toString()).toBe(personBackup2.id.toString());

    const copyPerson = createCopyEntityMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof copyPerson).toBe('function');
    if (!copyPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const person = await copyPerson(
      null,
      { whereOnes: { backups: { id: personBackup.id } } },
      { mongooseConn, pubsub },
    );
    expect(person.firstName).toBe(data.firstName);
    expect(person.lastName).toBe(data.lastName);
    expect(person.backups.map((id) => id.toString())).toEqual([
      personBackup.id.toString(),
      personBackup2.id.toString(),
    ]);
    expect(person.clone.toString()).toBe(personClone.id.toString());
  });
});
