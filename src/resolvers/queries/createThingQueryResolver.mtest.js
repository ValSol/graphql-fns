// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const mongoose = require('mongoose');

const createCreateThingMutationResolver = require('../mutations/createCreateThingMutationResolver');
const info = require('../info.auxiliary.js');
const createThingQueryResolver = require('./createThingQueryResolver');

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-thing-query';
  mongooseConn = await mongoose.connect(dbURI, { useNewUrlParser: true });
  await mongooseConn.connection.db.dropDatabase();
});

describe('createThingQueryResolver', () => {
  test('should create query thing resolver', async () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField1',
          unique: true,
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

    const createExample = createCreateThingMutationResolver(thingConfig);
    expect(typeof createExample).toBe('function');
    const data = {
      textField1: 'textField1',
      textField2: 'textField2',
      textField3: 'textField3',
      textField4: ['textField4'],
      textField5: ['textField5'],
    };
    const createdExample = await createExample(null, { data }, { mongooseConn });
    const { id } = createdExample;

    const Example = createThingQueryResolver(thingConfig);

    const where = { id };
    const example = await Example(null, { where }, { mongooseConn }, info);

    expect(example.textField1).toBe(data.textField1);
    expect(example.textField2).toBeUndefined();
    expect(example.textField3).toBe(data.textField3);
    expect(example.textField4).toBeUndefined();
    expect(example.textField5).toBeUndefined();
    expect(example.createdAt instanceof Date).toBeTruthy();
    expect(example.updatedAt).toBeUndefined();

    const where2 = { textField1: data.textField1 };
    const example2 = await Example(null, { where: where2 }, { mongooseConn }, info);

    expect(example2.textField1).toBe(data.textField1);
    expect(example2.textField2).toBeUndefined();
    expect(example2.textField3).toBe(data.textField3);
    expect(example2.textField4).toBeUndefined();
    expect(example2.textField5).toBeUndefined();
    expect(example2.createdAt instanceof Date).toBeTruthy();
    expect(example2.updatedAt).toBeUndefined();
  });
});
