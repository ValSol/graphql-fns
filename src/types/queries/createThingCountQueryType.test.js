// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import thingCountQueryAttributes from '../actionAttributes/thingCountQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createThingCountQueryType', () => {
  test('should create query things type without index fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
      ],
    };
    const expectedResult = '  ExampleCount(where: ExampleWhereInput): Int!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingCountQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });

  test('should create query things type with where arg', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
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
    const expectedResult = '  ExampleCount(where: ExampleWhereInput): Int!';

    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingCountQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
