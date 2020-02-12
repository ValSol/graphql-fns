// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createThingWhereOneInputType from './createThingWhereOneInputType';

describe('createThingWhereOneInputType', () => {
  test('should create thing input type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult = `input ExampleWhereOneInput {
  id: ID!
}`;

    const result = createThingWhereOneInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should create thing input type with several args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'email',
          unique: true,
        },
        {
          name: 'userId',
          unique: true,
        },
        {
          name: 'firstName',
        },
      ],
      fileFields: [
        {
          name: 'logo1',
          generalName: 'generalFile',
          fileType: 'fileType',
          unique: true,
        },
        {
          name: 'logo2',
          generalName: 'generalFile',
          fileType: 'fileType',
          unique: true,
        },
        {
          name: 'logo3',
          generalName: 'generalFile',
          fileType: 'fileType',
        },
      ],
      intFields: [
        {
          name: 'perosonaNum',
          unique: true,
        },
      ],
      floatFields: [
        {
          name: 'perosonaNumber',
          unique: true,
        },
      ],
      dateTimeFields: [
        {
          name: 'birthday',
          unique: true,
        },
      ],
    };
    const expectedResult = `input ExampleWhereOneInput {
  id: ID
  email: ID
  userId: ID
  logo1: ID
  logo2: ID
  perosonaNum: Int
  perosonaNumber: Float
  birthday: DateTime
}`;

    const result = createThingWhereOneInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
