// @flow
/* eslint-env jest */
const mongoose = require('mongoose');

const createCreateThingMutationResolver = require('./createCreateThingMutationResolver');

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-thing-mutation';
  mongooseConn = await mongoose.connect(dbURI, { useNewUrlParser: true });
  await mongooseConn.connection.db.dropDatabase();
});

describe('createCreateThingMutationResolver', () => {
  test('should create mutation add thing resolver', async () => {
    const thingConfig = {
      thingName: 'Example',
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
    expect(createdExample.textField1).toBe(data.textField1);
    expect(createdExample.textField2).toBe(data.textField2);
    expect(createdExample.textField3).toBe(data.textField3);
    expect(createdExample.textField4).toEqual(data.textField4);
    expect(createdExample.textField5).toEqual(data.textField5);
  });
});
