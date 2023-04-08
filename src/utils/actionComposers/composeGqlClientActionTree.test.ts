/* eslint-env jest */
import type { EntityConfig, GqlActionData } from '../../tsTypes';

import composeGqlClientActionTree from './composeGqlClientActionTree';

describe('composeGqlClientActionTree', () => {
  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
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

  const generalConfig = { allEntityConfigs: { Example: entityConfig } };

  test('should compose not nested fields with shift = 0', () => {
    const actionType = 'Query';
    const actionName = 'entity';
    const entityName = 'Example';
    const composeOptions = () => ({});
    const gqlActionData: GqlActionData = { actionType, actionName, composeOptions, entityName };
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
