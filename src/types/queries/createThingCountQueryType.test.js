// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const createThingCountQueryType = require('./createThingCountQueryType');

describe('createThingCountQueryType', () => {
  test('should create query things type without index fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
      ],
    };
    const expectedResult = '  ExampleCount: String!';

    const result = createThingCountQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create query things type with where arg', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'firstName',
          index: true,
        },
        {
          name: 'lastName',
          index: true,
        },
      ],
    };
    const expectedResult = '  ExampleCount(where: ExampleWhereInput): String!';

    const result = createThingCountQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
