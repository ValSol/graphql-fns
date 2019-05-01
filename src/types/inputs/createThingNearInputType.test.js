// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const createThingNearInputType = require('./createThingNearInputType');

describe('createThingNearInputType', () => {
  test('should create empty string if there are not any geospatial fields', () => {
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
    const expectedResult = '';

    const result = createThingNearInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are geospatial fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      geospatialFields: [
        {
          name: 'position',
          type: 'Point',
        },
        {
          name: 'area',
          type: 'Polygon',
        },
      ],
    };
    const expectedResult = `
input ExampleNearInput {
  position: GeospatialPointInput
  area: GeospatialPointInput
  maxDistance: Float
}`;

    const result = createThingNearInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
