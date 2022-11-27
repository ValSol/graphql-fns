// @flow
/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateManyEntitiesMutationResolver,
} = require('../createCreateManyEntitiesMutationResolver');
const {
  default: createUpdateManyEntitiesMutationResolver,
} = require('../createUpdateManyEntitiesMutationResolver');
const { default: createCopyManyEntitiesMutationResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-copy-many-entities-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createCopyManyEntitiesMutationResolver', () => {
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

    const createManyPersons = createCreateManyEntitiesMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createManyPersons).toBe('function');
    if (!createManyPersons) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = [
      { firstName: 'Hugo', lastName: 'Boss' },
      { firstName: 'Hugo2', lastName: 'Boss2' },
    ];

    const createdPersons = await createManyPersons(null, { data }, { mongooseConn, pubsub });
    const [createdPerson] = createdPersons;
    expect(createdPerson.firstName).toBe(data[0].firstName);
    expect(createdPerson.lastName).toBe(data[0].lastName);

    const copyManyPersonClones = createCopyManyEntitiesMutationResolver(
      personCloneConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof copyManyPersonClones).toBe('function');
    if (!copyManyPersonClones) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOnes = createdPersons.map((item) => ({ original: { id: item.id } }));

    const personClones = await copyManyPersonClones(
      null,
      {
        whereOnes,
        options: { original: { fieldsToCopy: ['firstName'] } },
      },
      { mongooseConn, pubsub },
    );

    const [personClone] = personClones;
    expect(personClone.firstName).toBe(data[0].firstName);
    expect(personClone.lastName).toBe(undefined);
    expect(personClone.original.toString()).toBe(createdPerson.id.toString());
    expect(personClones[1].firstName).toBe(data[1].firstName);
    expect(personClones[1].lastName).toBe(undefined);
    expect(personClones[1].original.toString()).toBe(createdPersons[1].id.toString());

    const copyManyPersonBackups = createCopyManyEntitiesMutationResolver(
      personBackupConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof copyManyPersonBackups).toBe('function');
    if (!copyManyPersonBackups) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const personBackups = await copyManyPersonBackups(
      null,
      { whereOnes },
      { mongooseConn, pubsub },
    );
    const [personBackup] = personBackups;
    expect(personBackup.firstName).toBe(data[0].firstName);
    expect(personBackup.lastName).toBe(data[0].lastName);
    expect(personBackup.original.toString()).toBe(createdPerson.id.toString());
    expect(personBackups[1].firstName).toBe(data[1].firstName);
    expect(personBackups[1].lastName).toBe(data[1].lastName);
    expect(personBackups[1].original.toString()).toBe(createdPersons[1].id.toString());

    const updateManyPersons = createUpdateManyEntitiesMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof updateManyPersons).toBe('function');
    if (!updateManyPersons) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data2 = [
      { firstName: 'Vasya', lastName: 'Puplkin' },
      { firstName: 'Vasya2', lastName: 'Puplkin2' },
    ];

    const updatedPersons = await updateManyPersons(
      null,
      {
        whereOne: createdPersons.map((item) => ({ id: item.id })),
        data: data2,
      },
      { mongooseConn, pubsub },
    );
    const [updatedPerson] = updatedPersons;
    expect(updatedPerson.firstName).toBe(data2[0].firstName);
    expect(updatedPerson.lastName).toBe(data2[0].lastName);

    const personClones2 = await copyManyPersonClones(null, { whereOnes }, { mongooseConn, pubsub });

    const [personClone2] = personClones2;
    expect(personClone2.firstName).toBe(data2[0].firstName);
    expect(personClone2.lastName).toBe(data2[0].lastName);
    expect(personClone2.original.toString()).toBe(createdPerson.id.toString());
    expect(personClone2.id.toString()).toBe(personClone.id.toString());
    expect(personClones2[1].firstName).toBe(data2[1].firstName);
    expect(personClones2[1].lastName).toBe(data2[1].lastName);
    expect(personClones2[1].original.toString()).toBe(createdPersons[1].id.toString());
    expect(personClones2[1].id.toString()).toBe(personClones[1].id.toString());

    const personBackups2 = await copyManyPersonBackups(
      null,
      { whereOnes },
      { mongooseConn, pubsub },
    );
    const [personBackup2] = personBackups2;
    expect(personBackup2.firstName).toBe(data2[0].firstName);
    expect(personBackup2.lastName).toBe(data2[0].lastName);
    expect(personBackups2[1].firstName).toBe(data2[1].firstName);
    expect(personBackups2[1].lastName).toBe(data2[1].lastName);

    const data3 = [
      { firstName: 'John', lastName: null },
      { firstName: 'John2', lastName: null },
    ];

    const updatedPersons2 = await updateManyPersons(
      null,
      { whereOne: createdPersons.map((item) => ({ id: item.id })), data: data3 },
      { mongooseConn, pubsub },
    );
    const [updatedPerson2] = updatedPersons2;
    expect(updatedPerson2.firstName).toBe(data3[0].firstName);
    expect(updatedPerson2.lastName).toBe(undefined);
    expect(updatedPersons2[1].firstName).toBe(data3[1].firstName);
    expect(updatedPersons2[1].lastName).toBe(undefined);

    const personBackups3 = await copyManyPersonBackups(
      null,
      {
        whereOnes,
        whereOne: personBackups2.map((item) => ({ id: item.id })),
      },
      { mongooseConn, pubsub },
    );
    const [personBackup3] = personBackups3;
    expect(personBackup3.firstName).toBe(data3[0].firstName);
    expect(personBackup3.lastName).toBe(undefined);
    expect(personBackup3.id.toString()).toBe(personBackup2.id.toString());
    expect(personBackups3[1].firstName).toBe(data3[1].firstName);
    expect(personBackups3[1].lastName).toBe(undefined);
    expect(personBackups3[1].id.toString()).toBe(personBackups2[1].id.toString());

    const copyManyPersons = createCopyManyEntitiesMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof copyManyPersons).toBe('function');
    if (!copyManyPersons) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const persons = await copyManyPersons(
      null,
      { whereOnes: personBackups.map((item) => ({ backups: { id: item.id } })) },
      { mongooseConn, pubsub },
    );
    const [person] = persons;
    expect(person.firstName).toBe(data[0].firstName);
    expect(person.lastName).toBe(data[0].lastName);
    expect(person.backups.map((id) => id.toString())).toEqual([
      personBackup.id.toString(),
      personBackup2.id.toString(),
    ]);
    expect(person.clone.toString()).toBe(personClone.id.toString());
    expect(persons[1].firstName).toBe(data[1].firstName);
    expect(persons[1].lastName).toBe(data[1].lastName);
    expect(persons[1].backups.map((id) => id.toString())).toEqual([
      personBackups[1].id.toString(),
      personBackups2[1].id.toString(),
    ]);
    expect(persons[1].clone.toString()).toBe(personClones[1].id.toString());
  });
});
