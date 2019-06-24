// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const mongoose = require('mongoose');

const mongoOptions = require('../../../test/mongo-options');
const {
  default: createCreateManyThingsMutationResolver,
} = require('./createCreateManyThingsMutationResolver');

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-thing-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

describe('createCreateManyThingsMutationResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: [] };
  test('should create mutation add thing resolver', async () => {
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

    const createManyExamples = createCreateManyThingsMutationResolver(thingConfig, generalConfig);
    expect(typeof createManyExamples).toBe('function');
    if (!createManyExamples) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = [
      {
        textField1: 'textField1',
        textField2: 'textField2',
        textField3: 'textField3',
        textField4: ['textField4'],
        textField5: ['textField5'],
      },
      {
        textField1: 'textField1-2',
        textField2: 'textField2-2',
        textField3: 'textField3-2',
        textField4: ['textField4-2'],
        textField5: ['textField5-2'],
      },
    ];

    const createdExamples = await createManyExamples(null, { data }, { mongooseConn });

    expect(createdExamples[0].textField1).toBe(data[0].textField1);
    expect(createdExamples[0].textField2).toBe(data[0].textField2);
    expect(createdExamples[0].textField3).toBe(data[0].textField3);
    expect(createdExamples[0].textField4).toEqual(data[0].textField4);
    expect(createdExamples[0].textField5).toEqual(data[0].textField5);
    expect(createdExamples[0].createdAt instanceof Date).toBeTruthy();
    expect(createdExamples[0].updatedAt instanceof Date).toBeTruthy();

    expect(createdExamples[1].textField1).toBe(data[1].textField1);
    expect(createdExamples[1].textField2).toBe(data[1].textField2);
    expect(createdExamples[1].textField3).toBe(data[1].textField3);
    expect(createdExamples[1].textField4).toEqual(data[1].textField4);
    expect(createdExamples[1].textField5).toEqual(data[1].textField5);
    expect(createdExamples[1].createdAt instanceof Date).toBeTruthy();
    expect(createdExamples[1].updatedAt instanceof Date).toBeTruthy();
  });
});
