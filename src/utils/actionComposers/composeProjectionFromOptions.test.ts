/* eslint-env jest */
import type { TangibleEntityConfig, GqlActionData } from '../../tsTypes';

import composeProjectionFromOptions from './composeProjectionFromOptions';

describe('composeProjectionFromOptions', () => {
  const entityConfig: TangibleEntityConfig = {
    name: 'Example',
    type: 'tangible',
    counter: true,
    textFields: [
      {
        name: 'ukTextField',
        type: 'textFields',
      },
      {
        name: 'ruTextField',
        type: 'textFields',
      },
      {
        name: 'enTextField',
        type: 'textFields',
      },
    ],
    dateTimeFields: [
      {
        name: 'dateTimeField',
        type: 'dateTimeFields',
      },
    ],
    intFields: [
      {
        name: 'intField',
        type: 'intFields',
      },
    ],
    floatFields: [
      {
        name: 'floatField',
        type: 'floatFields',
      },
    ],
    booleanFields: [
      {
        name: 'booleanField',
        type: 'booleanFields',
      },
    ],
    enumFields: [
      {
        name: 'enumField',
        enumName: 'enumeration',
        type: 'enumFields',
      },
    ],
    geospatialFields: [
      {
        name: 'geospatialPoint',
        geospatialType: 'Point',
        type: 'geospatialFields',
      },
      {
        name: 'geospatialPolygon',
        geospatialType: 'Polygon',
        type: 'geospatialFields',
      },
    ],
  };

  const generalConfig = { allEntityConfigs: { Example: entityConfig } };

  test('should compose all fields of entity', () => {
    const actionType = 'Query';
    const actionName = 'entity';
    const entityName = 'Example';
    const composeOptions = () => ({});
    const gqlActionData: GqlActionData = { actionType, actionName, composeOptions, entityName };

    const expectedResult = {
      _id: 1,
      createdAt: 1,
      updatedAt: 1,
      counter: 1,
      ukTextField: 1,
      ruTextField: 1,
      enTextField: 1,
      dateTimeField: 1,
      intField: 1,
      floatField: 1,
      booleanField: 1,
      enumField: 1,
      geospatialPoint: 1,
      geospatialPolygon: 1,
    };

    const result = composeProjectionFromOptions(gqlActionData, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose fields from include of entity', () => {
    const actionType = 'Query';
    const actionName = 'entity';
    const entityName = 'Example';
    const composeOptions = ({ lang }: any) => ({
      include: {
        [`${lang}TextField`]: true,
        updatedAt: true,
      },
    });
    const optionsArg = { lang: 'uk' };
    const gqlActionData: GqlActionData = { actionType, actionName, composeOptions, entityName };

    const expectedResult = {
      _id: 1,
      ukTextField: 1,
      updatedAt: 1,
    };

    const result = composeProjectionFromOptions(gqlActionData, generalConfig, optionsArg);
    expect(result).toEqual(expectedResult);
  });

  test('should compose all fields of entity', () => {
    const actionType = 'Query';
    const actionName = 'entity';
    const entityName = 'Example';
    const composeOptions = () => ({
      exclude: {
        enumField: true,
        geospatialPoint: true,
        geospatialPolygon: true,
      },
    });
    const gqlActionData: GqlActionData = { actionType, actionName, composeOptions, entityName };

    const expectedResult = {
      _id: 1,
      createdAt: 1,
      updatedAt: 1,
      counter: 1,
      ukTextField: 1,
      ruTextField: 1,
      enTextField: 1,
      dateTimeField: 1,
      intField: 1,
      floatField: 1,
      booleanField: 1,
    };

    const result = composeProjectionFromOptions(gqlActionData, generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
