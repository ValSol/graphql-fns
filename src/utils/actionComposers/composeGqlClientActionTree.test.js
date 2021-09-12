// @flow
/* eslint-env jest */
import type { ThingConfig, GqlActionData } from '../../flowTypes';

import composeGqlClientActionTree from './composeGqlClientActionTree';

describe('composeGqlClientActionTree', () => {
  const thingConfig: ThingConfig = {
    name: 'Example',
    counter: true,
    textFields: [
      {
        name: 'textField',
      },
    ],
    dateTimeFields: [
      {
        name: 'dateTimeField',
      },
    ],
    intFields: [
      {
        name: 'intField',
      },
    ],
    floatFields: [
      {
        name: 'floatField',
      },
    ],
    booleanFields: [
      {
        name: 'booleanField',
      },
    ],
    enumFields: [
      {
        name: 'enumField',
        enumName: 'enumeration',
      },
    ],
    geospatialFields: [
      {
        name: 'geospatialPoint',
        geospatialType: 'Point',
      },
      {
        name: 'geospatialPolygon',
        geospatialType: 'Polygon',
      },
    ],
  };

  const generalConfig = { thingConfigs: { Example: thingConfig } };

  test('should compose not nested fields with shift = 0', () => {
    const actionType = 'Query';
    const actionName = 'thing';
    const thingName = 'Example';
    const composeOptions = () => ({});
    const gqlActionData: GqlActionData = { actionType, actionName, composeOptions, thingName };
    const namePrefix = 'Cabinet_Main';

    const expectedResult = {
      name: 'Cabinet_Main_Example',
      content: `query Cabinet_Main_Example($whereOne: ExampleWhereOneInput!) {
  Example(whereOne: $whereOne) {
    id
    createdAt
    updatedAt
    counter
    textField
    dateTimeField
    intField
    floatField
    booleanField
    enumField
    geospatialPoint {
      lng
      lat
    }
    geospatialPolygon {
      externalRing {
        ring {
          lng
          lat
        }
      }
      internalRings {
        ring {
          lng
          lat
        }
      }
    }
  }
}`,
    };

    const result = composeGqlClientActionTree(gqlActionData, namePrefix, generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
