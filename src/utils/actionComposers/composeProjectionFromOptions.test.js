// @flow
/* eslint-env jest */
import type { EntityConfig, GqlActionData } from '../../flowTypes';

import composeProjectionFromOptions from './composeProjectionFromOptions';

describe('composeProjectionFromOptions', () => {
  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    counter: true,
    textFields: [
      {
        name: 'ukTextField',
      },
      {
        name: 'ruTextField',
      },
      {
        name: 'enTextField',
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
    const composeOptions = ({ lang }) => ({
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
