/* eslint-env jest */
import type { EntityConfig, ClientFieldsOptions } from '../tsTypes';

import composeFields from './composeFields';

describe('composeFields', () => {
  describe('not nested fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      counter: true,
      textFields: [
        {
          name: 'textField',
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

    test('should compose not nested fields with shift = 0', () => {
      const options: ClientFieldsOptions = { shift: 0 };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'counter',
        'textField',
        'dateTimeField',
        'intField',
        'floatField',
        'booleanField',
        'enumField',
        'geospatialPoint {',
        '  lng',
        '  lat',
        '}',
        'geospatialPolygon {',
        '  externalRing {',
        '    ring {',
        '      lng',
        '      lat',
        '    }',
        '  }',
        '  internalRings {',
        '    ring {',
        '      lng',
        '      lat',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(entityConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with shift = 1', () => {
      const options: ClientFieldsOptions = { shift: 1 };
      const expectedResult = [
        '  id',
        '  createdAt',
        '  updatedAt',
        '  counter',
        '  textField',
        '  dateTimeField',
        '  intField',
        '  floatField',
        '  booleanField',
        '  enumField',
        '  geospatialPoint {',
        '    lng',
        '    lat',
        '  }',
        '  geospatialPolygon {',
        '    externalRing {',
        '      ring {',
        '        lng',
        '        lat',
        '      }',
        '    }',
        '    internalRings {',
        '      ring {',
        '        lng',
        '        lat',
        '      }',
        '    }',
        '  }',
      ];

      const { fields: result } = composeFields(entityConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with include aliases', () => {
      const include = {
        'textFieldAlias: textField': true,
        'dateTimeFieldAlias: dateTimeField': true,
        'intFieldAlias: intField': true,
        'floatFieldAlias: floatField': true,
        'booleanFieldAlias: booleanField': true,
        'enumFieldAlias: enumField': true,
        'geospatialPointAlias: geospatialPoint': true,
        'geospatialPolygonAlias: geospatialPolygon': true,
      };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'textFieldAlias: textField',
        'dateTimeFieldAlias: dateTimeField',
        'intFieldAlias: intField',
        'floatFieldAlias: floatField',
        'booleanFieldAlias: booleanField',
        'enumFieldAlias: enumField',
        'geospatialPointAlias: geospatialPoint {',
        '  lng',
        '  lat',
        '}',
        'geospatialPolygonAlias: geospatialPolygon {',
        '  externalRing {',
        '    ring {',
        '      lng',
        '      lat',
        '    }',
        '  }',
        '  internalRings {',
        '    ring {',
        '      lng',
        '      lat',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(entityConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with include option 1', () => {
      const include = {
        counter: true,
        textField: true,
        intField: true,
        geospatialPoint: { lng: true },
        geospatialPolygon: { externalRing: { ring: { lng: true } } },
      };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'counter',
        'textField',
        'intField',
        'geospatialPoint {',
        '  lng',
        '}',
        'geospatialPolygon {',
        '  externalRing {',
        '    ring {',
        '      lng',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(entityConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with exclude option 1', () => {
      const exclude = {
        textField: true,
        intField: true,
        geospatialPoint: { lng: true },
        geospatialPolygon: { externalRing: { ring: { lng: true } } },
      };
      const options: ClientFieldsOptions = { shift: 0, exclude };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'counter',
        'dateTimeField',
        'floatField',
        'booleanField',
        'enumField',
        'geospatialPoint {',
        '  lat',
        '}',
        'geospatialPolygon {',
        '  externalRing {',
        '    ring {',
        '      lat',
        '    }',
        '  }',
        '  internalRings {',
        '    ring {',
        '      lng',
        '      lat',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(entityConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with exclude option 2', () => {
      const exclude = {
        textField: true,
        intField: true,
        geospatialPoint: { lng: true },
        geospatialPolygon: { externalRing: { ring: true } },
      };
      const options: ClientFieldsOptions = { shift: 0, exclude };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'counter',
        'dateTimeField',
        'floatField',
        'booleanField',
        'enumField',
        'geospatialPoint {',
        '  lat',
        '}',
        'geospatialPolygon {',
        '  internalRings {',
        '    ring {',
        '      lng',
        '      lat',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(entityConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with exclude option 3', () => {
      const exclude = {
        textField: true,
        intField: true,
        geospatialPoint: { lng: true },
        geospatialPolygon: { externalRing: true },
      };
      const options: ClientFieldsOptions = { shift: 0, exclude };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'counter',
        'dateTimeField',
        'floatField',
        'booleanField',
        'enumField',
        'geospatialPoint {',
        '  lat',
        '}',
        'geospatialPolygon {',
        '  internalRings {',
        '    ring {',
        '      lng',
        '      lat',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(entityConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with include option 2', () => {
      const include = {
        textField: true,
        intField: true,
        geospatialPoint: { lng: true },
        geospatialPolygon: { internalRings: { ring: { lng: true } } },
      };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'textField',
        'intField',
        'geospatialPoint {',
        '  lng',
        '}',
        'geospatialPolygon {',
        '  internalRings {',
        '    ring {',
        '      lng',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(entityConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with include option 3', () => {
      const include = {
        textField: true,
        intField: true,
        geospatialPoint: { lng: true },
        geospatialPolygon: { externalRing: { ring: true } },
      };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'textField',
        'intField',
        'geospatialPoint {',
        '  lng',
        '}',
        'geospatialPolygon {',
        '  externalRing {',
        '    ring {',
        '      lng',
        '      lat',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(entityConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with include option 4', () => {
      const include = {
        textField: true,
        intField: true,
        geospatialPoint: { lng: true },
        geospatialPolygon: { externalRing: true },
      };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'textField',
        'intField',
        'geospatialPoint {',
        '  lng',
        '}',
        'geospatialPolygon {',
        '  externalRing {',
        '    ring {',
        '      lng',
        '      lat',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(entityConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Embedded fields', () => {
    const embedded3Config: EntityConfig = {
      name: 'Embedded3',
      type: 'embedded',
      textFields: [
        { name: 'textField3', type: 'textFields' },
        { name: 'textFieldArr3', array: true, type: 'textFields' },
      ],
    };

    const embedded2Config: EntityConfig = {
      name: 'Embedded2',
      type: 'embedded',
      textFields: [
        { name: 'textField2', type: 'textFields' },
        { name: 'textFieldArr2', array: true, type: 'textFields' },
      ],
      embeddedFields: [
        {
          name: 'embeddedField3',
          config: embedded3Config,
          type: 'embeddedFields',
        },
      ],
    };

    const embedded1Config: EntityConfig = {
      name: 'Embedded1',
      type: 'embedded',
      textFields: [
        { name: 'textField1', type: 'textFields' },
        { name: 'textFieldArr1', array: true, type: 'textFields' },
      ],
      embeddedFields: [
        {
          name: 'embeddedField2',
          config: embedded2Config,
          array: true,
          type: 'embeddedFields',
        },
      ],
    };

    const exampleConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField1',
          config: embedded1Config,
          type: 'embeddedFields',
        },
      ],
    };

    const generalConfig = {
      allEntityConfigs: {
        Embedded1: embedded1Config,
        Embedded2: embedded2Config,
        Embedded3: embedded3Config,
        Example: exampleConfig,
      },
    };

    test('should compose embedded fields with alias', () => {
      const include = { 'embeddedField1Alias: embeddedField1': true };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'embeddedField1Alias: embeddedField1 {',
        '  id',
        '  textField1',
        '  textFieldArr1',
        '  embeddedField2 {',
        '    id',
        '    textField2',
        '    textFieldArr2',
        '    embeddedField3 {',
        '      id',
        '      textField3',
        '      textFieldArr3',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(exampleConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with alias 2', () => {
      const include = {
        embeddedField1: {
          'textField1Alias: textField1': true,
          'embeddedField2Alias: embeddedField2': true,
        },
      };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'embeddedField1 {',
        '  textField1Alias: textField1',
        '  embeddedField2Alias: embeddedField2 {',
        '    id',
        '    textField2',
        '    textFieldArr2',
        '    embeddedField3 {',
        '      id',
        '      textField3',
        '      textFieldArr3',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(exampleConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields', () => {
      const options: ClientFieldsOptions = { shift: 0 };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'textField',
        'embeddedField1 {',
        '  id',
        '  textField1',
        '  textFieldArr1',
        '  embeddedField2 {',
        '    id',
        '    textField2',
        '    textFieldArr2',
        '    embeddedField3 {',
        '      id',
        '      textField3',
        '      textFieldArr3',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(exampleConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with include option 1', () => {
      const include = { textField: true };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = ['textField'];

      const { fields: result } = composeFields(exampleConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with include option 2', () => {
      const include = { embeddedField1: true };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'embeddedField1 {',
        '  id',
        '  textField1',
        '  textFieldArr1',
        '  embeddedField2 {',
        '    id',
        '    textField2',
        '    textFieldArr2',
        '    embeddedField3 {',
        '      id',
        '      textField3',
        '      textFieldArr3',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(exampleConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with include option 3', () => {
      const include = { embeddedField1: { textField1: true } };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = ['embeddedField1 {', '  textField1', '}'];

      const { fields: result } = composeFields(exampleConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with include option 4', () => {
      const include = { embeddedField1: { embeddedField2: { textField2: true } } };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'embeddedField1 {',
        '  embeddedField2 {',
        '    textField2',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(exampleConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with exclude option 1', () => {
      const exclude = { embeddedField1: true };
      const options: ClientFieldsOptions = { shift: 0, exclude };
      const expectedResult = ['id', 'createdAt', 'updatedAt', 'textField'];

      const { fields: result } = composeFields(exampleConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with exclude option 2', () => {
      const exclude = { embeddedField1: { embeddedField2: true } };
      const options: ClientFieldsOptions = { shift: 0, exclude };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'textField',
        'embeddedField1 {',
        '  id',
        '  textField1',
        '  textFieldArr1',
        '}',
      ];

      const { fields: result } = composeFields(exampleConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with exclude option 3', () => {
      const exclude = { embeddedField1: { embeddedField2: { embeddedField3: true } } };
      const options: ClientFieldsOptions = { shift: 0, exclude };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'textField',
        'embeddedField1 {',
        '  id',
        '  textField1',
        '  textFieldArr1',
        '  embeddedField2 {',
        '    id',
        '    textField2',
        '    textFieldArr2',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(exampleConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Relatioanl and duplex fields', () => {
    const personConfig = {} as EntityConfig;
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          type: 'textFields',
        },
        {
          name: 'secondName',
          type: 'textFields',
        },
        {
          name: 'features',
          array: true,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'friends',
          oppositeName: 'fellows',
          array: true,
          config: personConfig,
          type: 'relationalFields',
        },
        {
          name: 'fellows',
          oppositeName: 'friends',
          array: true,
          parent: true,
          config: personConfig,
          type: 'relationalFields',
        },
      ],
      duplexFields: [
        {
          name: 'parent',
          config: personConfig,
          oppositeName: 'children',
          type: 'duplexFields',
        },
        {
          name: 'children',
          array: true,
          config: personConfig,
          oppositeName: 'parent',
          type: 'duplexFields',
        },
      ],
    });

    const generalConfig = { allEntityConfigs: { Person: personConfig } };

    test('should compose relatioanl and duplex fields without depth', () => {
      const options: ClientFieldsOptions = { shift: 0 };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'firstName',
        'secondName',
        'features(slice: $features_slice)',
        'friends(where: $friends_where, sort: $friends_sort, pagination: $friends_pagination) {',
        '  id',
        '}',
        'fellows(where: $fellows_where, sort: $fellows_sort, pagination: $fellows_pagination) {',
        '  id',
        '}',
        'parent {',
        '  id',
        '}',
        'children(where: $children_where, sort: $children_sort, pagination: $children_pagination) {',
        '  id',
        '}',
      ];

      const { fields: result, childArgs } = composeFields(personConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);

      const expectedChildArgs = {
        children_pagination: 'PaginationInput',
        children_sort: 'PersonSortInput',
        children_where: 'PersonWhereInput',
        features_slice: 'SliceInput',
        fellows_pagination: 'PaginationInput',
        fellows_sort: 'PersonSortInput',
        fellows_where: 'PersonWhereInput',
        friends_pagination: 'PaginationInput',
        friends_sort: 'PersonSortInput',
        friends_where: 'PersonWhereInput',
      };

      expect(childArgs).toEqual(expectedChildArgs);
    });

    test('should compose relatioanl and duplex fields with depth: 0', () => {
      const options: ClientFieldsOptions = { shift: 0, depth: 0 };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'firstName',
        'secondName',
        'features(slice: $features_slice)',
        'friends(where: $friends_where, sort: $friends_sort, pagination: $friends_pagination) {',
        '  id',
        '}',
        'fellows(where: $fellows_where, sort: $fellows_sort, pagination: $fellows_pagination) {',
        '  id',
        '}',
        'parent {',
        '  id',
        '}',
        'children(where: $children_where, sort: $children_sort, pagination: $children_pagination) {',
        '  id',
        '}',
      ];

      const { fields: result } = composeFields(personConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose relatioanl and duplex fields with depth: 1', () => {
      const options: ClientFieldsOptions = { shift: 0, depth: 1 };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'firstName',
        'secondName',
        'features(slice: $features_slice)',
        'friends(where: $friends_where, sort: $friends_sort, pagination: $friends_pagination) {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  features(slice: $friends_features_slice)',
        '  friends(where: $friends_friends_where, sort: $friends_friends_sort, pagination: $friends_friends_pagination) {',
        '    id',
        '  }',
        '  fellows(where: $friends_fellows_where, sort: $friends_fellows_sort, pagination: $friends_fellows_pagination) {',
        '    id',
        '  }',
        '  parent {',
        '    id',
        '  }',
        '  children(where: $friends_children_where, sort: $friends_children_sort, pagination: $friends_children_pagination) {',
        '    id',
        '  }',
        '}',
        'fellows(where: $fellows_where, sort: $fellows_sort, pagination: $fellows_pagination) {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  features(slice: $fellows_features_slice)',
        '  friends(where: $fellows_friends_where, sort: $fellows_friends_sort, pagination: $fellows_friends_pagination) {',
        '    id',
        '  }',
        '  fellows(where: $fellows_fellows_where, sort: $fellows_fellows_sort, pagination: $fellows_fellows_pagination) {',
        '    id',
        '  }',
        '  parent {',
        '    id',
        '  }',
        '  children(where: $fellows_children_where, sort: $fellows_children_sort, pagination: $fellows_children_pagination) {',
        '    id',
        '  }',
        '}',
        'parent {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  features(slice: $parent_features_slice)',
        '  friends(where: $parent_friends_where, sort: $parent_friends_sort, pagination: $parent_friends_pagination) {',
        '    id',
        '  }',
        '  fellows(where: $parent_fellows_where, sort: $parent_fellows_sort, pagination: $parent_fellows_pagination) {',
        '    id',
        '  }',
        '  parent {',
        '    id',
        '  }',
        '  children(where: $parent_children_where, sort: $parent_children_sort, pagination: $parent_children_pagination) {',
        '    id',
        '  }',
        '}',
        'children(where: $children_where, sort: $children_sort, pagination: $children_pagination) {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  features(slice: $children_features_slice)',
        '  friends(where: $children_friends_where, sort: $children_friends_sort, pagination: $children_friends_pagination) {',
        '    id',
        '  }',
        '  fellows(where: $children_fellows_where, sort: $children_fellows_sort, pagination: $children_fellows_pagination) {',
        '    id',
        '  }',
        '  parent {',
        '    id',
        '  }',
        '  children(where: $children_children_where, sort: $children_children_sort, pagination: $children_children_pagination) {',
        '    id',
        '  }',
        '}',
      ];

      const { fields: result, childArgs } = composeFields(personConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);

      const expectedChildArgs = {
        children_children_pagination: 'PaginationInput',
        children_children_sort: 'PersonSortInput',
        children_children_where: 'PersonWhereInput',
        children_features_slice: 'SliceInput',
        children_fellows_pagination: 'PaginationInput',
        children_fellows_sort: 'PersonSortInput',
        children_fellows_where: 'PersonWhereInput',
        children_friends_pagination: 'PaginationInput',
        children_friends_sort: 'PersonSortInput',
        children_friends_where: 'PersonWhereInput',
        children_pagination: 'PaginationInput',
        children_sort: 'PersonSortInput',
        children_where: 'PersonWhereInput',
        features_slice: 'SliceInput',
        fellows_children_pagination: 'PaginationInput',
        fellows_children_sort: 'PersonSortInput',
        fellows_children_where: 'PersonWhereInput',
        fellows_features_slice: 'SliceInput',
        fellows_fellows_pagination: 'PaginationInput',
        fellows_fellows_sort: 'PersonSortInput',
        fellows_fellows_where: 'PersonWhereInput',
        fellows_friends_pagination: 'PaginationInput',
        fellows_friends_sort: 'PersonSortInput',
        fellows_friends_where: 'PersonWhereInput',
        fellows_pagination: 'PaginationInput',
        fellows_sort: 'PersonSortInput',
        fellows_where: 'PersonWhereInput',
        friends_children_pagination: 'PaginationInput',
        friends_children_sort: 'PersonSortInput',
        friends_children_where: 'PersonWhereInput',
        friends_features_slice: 'SliceInput',
        friends_fellows_pagination: 'PaginationInput',
        friends_fellows_sort: 'PersonSortInput',
        friends_fellows_where: 'PersonWhereInput',
        friends_friends_pagination: 'PaginationInput',
        friends_friends_sort: 'PersonSortInput',
        friends_friends_where: 'PersonWhereInput',
        friends_pagination: 'PaginationInput',
        friends_sort: 'PersonSortInput',
        friends_where: 'PersonWhereInput',
        parent_children_pagination: 'PaginationInput',
        parent_children_sort: 'PersonSortInput',
        parent_children_where: 'PersonWhereInput',
        parent_features_slice: 'SliceInput',
        parent_fellows_pagination: 'PaginationInput',
        parent_fellows_sort: 'PersonSortInput',
        parent_fellows_where: 'PersonWhereInput',
        parent_friends_pagination: 'PaginationInput',
        parent_friends_sort: 'PersonSortInput',
        parent_friends_where: 'PersonWhereInput',
      };
      expect(childArgs).toEqual(expectedChildArgs);
    });

    test('should compose relatioanl and duplex fields with depth: 2', () => {
      const options: ClientFieldsOptions = { shift: 0, depth: 2 };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'firstName',
        'secondName',
        'features(slice: $features_slice)',
        'friends(where: $friends_where, sort: $friends_sort, pagination: $friends_pagination) {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  features(slice: $friends_features_slice)',
        '  friends(where: $friends_friends_where, sort: $friends_friends_sort, pagination: $friends_friends_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $friends_friends_features_slice)',
        '    friends(where: $friends_friends_friends_where, sort: $friends_friends_friends_sort, pagination: $friends_friends_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $friends_friends_fellows_where, sort: $friends_friends_fellows_sort, pagination: $friends_friends_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $friends_friends_children_where, sort: $friends_friends_children_sort, pagination: $friends_friends_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  fellows(where: $friends_fellows_where, sort: $friends_fellows_sort, pagination: $friends_fellows_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $friends_fellows_features_slice)',
        '    friends(where: $friends_fellows_friends_where, sort: $friends_fellows_friends_sort, pagination: $friends_fellows_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $friends_fellows_fellows_where, sort: $friends_fellows_fellows_sort, pagination: $friends_fellows_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $friends_fellows_children_where, sort: $friends_fellows_children_sort, pagination: $friends_fellows_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  parent {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $friends_parent_features_slice)',
        '    friends(where: $friends_parent_friends_where, sort: $friends_parent_friends_sort, pagination: $friends_parent_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $friends_parent_fellows_where, sort: $friends_parent_fellows_sort, pagination: $friends_parent_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $friends_parent_children_where, sort: $friends_parent_children_sort, pagination: $friends_parent_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  children(where: $friends_children_where, sort: $friends_children_sort, pagination: $friends_children_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $friends_children_features_slice)',
        '    friends(where: $friends_children_friends_where, sort: $friends_children_friends_sort, pagination: $friends_children_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $friends_children_fellows_where, sort: $friends_children_fellows_sort, pagination: $friends_children_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $friends_children_children_where, sort: $friends_children_children_sort, pagination: $friends_children_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '}',
        'fellows(where: $fellows_where, sort: $fellows_sort, pagination: $fellows_pagination) {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  features(slice: $fellows_features_slice)',
        '  friends(where: $fellows_friends_where, sort: $fellows_friends_sort, pagination: $fellows_friends_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $fellows_friends_features_slice)',
        '    friends(where: $fellows_friends_friends_where, sort: $fellows_friends_friends_sort, pagination: $fellows_friends_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $fellows_friends_fellows_where, sort: $fellows_friends_fellows_sort, pagination: $fellows_friends_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $fellows_friends_children_where, sort: $fellows_friends_children_sort, pagination: $fellows_friends_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  fellows(where: $fellows_fellows_where, sort: $fellows_fellows_sort, pagination: $fellows_fellows_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $fellows_fellows_features_slice)',
        '    friends(where: $fellows_fellows_friends_where, sort: $fellows_fellows_friends_sort, pagination: $fellows_fellows_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $fellows_fellows_fellows_where, sort: $fellows_fellows_fellows_sort, pagination: $fellows_fellows_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $fellows_fellows_children_where, sort: $fellows_fellows_children_sort, pagination: $fellows_fellows_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  parent {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $fellows_parent_features_slice)',
        '    friends(where: $fellows_parent_friends_where, sort: $fellows_parent_friends_sort, pagination: $fellows_parent_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $fellows_parent_fellows_where, sort: $fellows_parent_fellows_sort, pagination: $fellows_parent_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $fellows_parent_children_where, sort: $fellows_parent_children_sort, pagination: $fellows_parent_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  children(where: $fellows_children_where, sort: $fellows_children_sort, pagination: $fellows_children_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $fellows_children_features_slice)',
        '    friends(where: $fellows_children_friends_where, sort: $fellows_children_friends_sort, pagination: $fellows_children_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $fellows_children_fellows_where, sort: $fellows_children_fellows_sort, pagination: $fellows_children_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $fellows_children_children_where, sort: $fellows_children_children_sort, pagination: $fellows_children_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '}',
        'parent {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  features(slice: $parent_features_slice)',
        '  friends(where: $parent_friends_where, sort: $parent_friends_sort, pagination: $parent_friends_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $parent_friends_features_slice)',
        '    friends(where: $parent_friends_friends_where, sort: $parent_friends_friends_sort, pagination: $parent_friends_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $parent_friends_fellows_where, sort: $parent_friends_fellows_sort, pagination: $parent_friends_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $parent_friends_children_where, sort: $parent_friends_children_sort, pagination: $parent_friends_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  fellows(where: $parent_fellows_where, sort: $parent_fellows_sort, pagination: $parent_fellows_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $parent_fellows_features_slice)',
        '    friends(where: $parent_fellows_friends_where, sort: $parent_fellows_friends_sort, pagination: $parent_fellows_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $parent_fellows_fellows_where, sort: $parent_fellows_fellows_sort, pagination: $parent_fellows_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $parent_fellows_children_where, sort: $parent_fellows_children_sort, pagination: $parent_fellows_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  parent {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $parent_parent_features_slice)',
        '    friends(where: $parent_parent_friends_where, sort: $parent_parent_friends_sort, pagination: $parent_parent_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $parent_parent_fellows_where, sort: $parent_parent_fellows_sort, pagination: $parent_parent_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $parent_parent_children_where, sort: $parent_parent_children_sort, pagination: $parent_parent_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  children(where: $parent_children_where, sort: $parent_children_sort, pagination: $parent_children_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $parent_children_features_slice)',
        '    friends(where: $parent_children_friends_where, sort: $parent_children_friends_sort, pagination: $parent_children_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $parent_children_fellows_where, sort: $parent_children_fellows_sort, pagination: $parent_children_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $parent_children_children_where, sort: $parent_children_children_sort, pagination: $parent_children_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '}',
        'children(where: $children_where, sort: $children_sort, pagination: $children_pagination) {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  features(slice: $children_features_slice)',
        '  friends(where: $children_friends_where, sort: $children_friends_sort, pagination: $children_friends_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $children_friends_features_slice)',
        '    friends(where: $children_friends_friends_where, sort: $children_friends_friends_sort, pagination: $children_friends_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $children_friends_fellows_where, sort: $children_friends_fellows_sort, pagination: $children_friends_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $children_friends_children_where, sort: $children_friends_children_sort, pagination: $children_friends_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  fellows(where: $children_fellows_where, sort: $children_fellows_sort, pagination: $children_fellows_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $children_fellows_features_slice)',
        '    friends(where: $children_fellows_friends_where, sort: $children_fellows_friends_sort, pagination: $children_fellows_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $children_fellows_fellows_where, sort: $children_fellows_fellows_sort, pagination: $children_fellows_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $children_fellows_children_where, sort: $children_fellows_children_sort, pagination: $children_fellows_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  parent {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $children_parent_features_slice)',
        '    friends(where: $children_parent_friends_where, sort: $children_parent_friends_sort, pagination: $children_parent_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $children_parent_fellows_where, sort: $children_parent_fellows_sort, pagination: $children_parent_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $children_parent_children_where, sort: $children_parent_children_sort, pagination: $children_parent_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  children(where: $children_children_where, sort: $children_children_sort, pagination: $children_children_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $children_children_features_slice)',
        '    friends(where: $children_children_friends_where, sort: $children_children_friends_sort, pagination: $children_children_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $children_children_fellows_where, sort: $children_children_fellows_sort, pagination: $children_children_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $children_children_children_where, sort: $children_children_children_sort, pagination: $children_children_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(personConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose relatioanl and duplex fields with depth: 0 & include option 1', () => {
      const include = {
        id: true,
        friends: true,
        parent: true,
      };
      const options: ClientFieldsOptions = { shift: 0, depth: 0, include };
      const expectedResult = [
        'id',
        'friends(where: $friends_where, sort: $friends_sort, pagination: $friends_pagination) {',
        '  id',
        '}',
        'parent {',
        '  id',
        '}',
      ];

      const { fields: result } = composeFields(personConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose relatioanl and duplex fields with depth: 2 & include option 1', () => {
      const include = {
        id: true,
        friends: { id: true },
        parent: { firstName: true },
        children: { secondName: true },
      };
      const options: ClientFieldsOptions = { shift: 0, depth: 2, include };
      const expectedResult = [
        'id',
        'friends(where: $friends_where, sort: $friends_sort, pagination: $friends_pagination) {',
        '  id',
        '}',
        'parent {',
        '  firstName',
        '}',
        'children(where: $children_where, sort: $children_sort, pagination: $children_pagination) {',
        '  secondName',
        '}',
      ];

      const { fields: result } = composeFields(personConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose relatioanl and duplex fields with depth: 0 & include option with aliases', () => {
      const include = {
        id: true,
        'friendsAlias: friends': true,
        'parentAlias: parent': true,
      };
      const options: ClientFieldsOptions = { shift: 0, depth: 0, include };
      const expectedResult = [
        'id',
        'friendsAlias: friends(where: $friendsAlias_where, sort: $friendsAlias_sort, pagination: $friendsAlias_pagination) {',
        '  id',
        '}',
        'parentAlias: parent {',
        '  id',
        '}',
      ];

      const { fields: result } = composeFields(personConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose relatioanl and duplex fields with depth: 2 & include option with aliases', () => {
      const include = {
        id: true,
        'friendsAlias: friends': { id: true },
        'parentAlias: parent': { firstName: true },
        'childrenAlias: children': { secondName: true },
      };
      const options: ClientFieldsOptions = { shift: 0, depth: 2, include };
      const expectedResult = [
        'id',
        'friendsAlias: friends(where: $friendsAlias_where, sort: $friendsAlias_sort, pagination: $friendsAlias_pagination) {',
        '  id',
        '}',
        'parentAlias: parent {',
        '  firstName',
        '}',
        'childrenAlias: children(where: $childrenAlias_where, sort: $childrenAlias_sort, pagination: $childrenAlias_pagination) {',
        '  secondName',
        '}',
      ];

      const { fields: result } = composeFields(personConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose relatioanl and duplex fields with depth: 2 & include option 2', () => {
      const include = {
        id: true,
        friends: { id: true, friends: true },
        parent: { firstName: true, parent: true },
        children: { secondName: true, children: true },
      };
      const options: ClientFieldsOptions = { shift: 0, depth: 2, include };
      const expectedResult = [
        'id',
        'friends(where: $friends_where, sort: $friends_sort, pagination: $friends_pagination) {',
        '  id',
        '  friends(where: $friends_friends_where, sort: $friends_friends_sort, pagination: $friends_friends_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $friends_friends_features_slice)',
        '    friends(where: $friends_friends_friends_where, sort: $friends_friends_friends_sort, pagination: $friends_friends_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $friends_friends_fellows_where, sort: $friends_friends_fellows_sort, pagination: $friends_friends_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $friends_friends_children_where, sort: $friends_friends_children_sort, pagination: $friends_friends_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '}',
        'parent {',
        '  firstName',
        '  parent {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $parent_parent_features_slice)',
        '    friends(where: $parent_parent_friends_where, sort: $parent_parent_friends_sort, pagination: $parent_parent_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $parent_parent_fellows_where, sort: $parent_parent_fellows_sort, pagination: $parent_parent_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $parent_parent_children_where, sort: $parent_parent_children_sort, pagination: $parent_parent_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '}',
        'children(where: $children_where, sort: $children_sort, pagination: $children_pagination) {',
        '  secondName',
        '  children(where: $children_children_where, sort: $children_children_sort, pagination: $children_children_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $children_children_features_slice)',
        '    friends(where: $children_children_friends_where, sort: $children_children_friends_sort, pagination: $children_children_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $children_children_fellows_where, sort: $children_children_fellows_sort, pagination: $children_children_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $children_children_children_where, sort: $children_children_children_sort, pagination: $children_children_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(personConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose relatioanl and duplex fields with depth: 2 & exclude option', () => {
      const exclude = {
        friends: { parent: true, children: true },
        parent: { friends: true, children: true },
        children: { friends: true, parent: true },
      };
      const options: ClientFieldsOptions = { shift: 0, depth: 2, exclude };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'firstName',
        'secondName',
        'features(slice: $features_slice)',
        'friends(where: $friends_where, sort: $friends_sort, pagination: $friends_pagination) {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  features(slice: $friends_features_slice)',
        '  friends(where: $friends_friends_where, sort: $friends_friends_sort, pagination: $friends_friends_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $friends_friends_features_slice)',
        '    friends(where: $friends_friends_friends_where, sort: $friends_friends_friends_sort, pagination: $friends_friends_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $friends_friends_fellows_where, sort: $friends_friends_fellows_sort, pagination: $friends_friends_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $friends_friends_children_where, sort: $friends_friends_children_sort, pagination: $friends_friends_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  fellows(where: $friends_fellows_where, sort: $friends_fellows_sort, pagination: $friends_fellows_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $friends_fellows_features_slice)',
        '    friends(where: $friends_fellows_friends_where, sort: $friends_fellows_friends_sort, pagination: $friends_fellows_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $friends_fellows_fellows_where, sort: $friends_fellows_fellows_sort, pagination: $friends_fellows_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $friends_fellows_children_where, sort: $friends_fellows_children_sort, pagination: $friends_fellows_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '}',
        'fellows(where: $fellows_where, sort: $fellows_sort, pagination: $fellows_pagination) {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  features(slice: $fellows_features_slice)',
        '  friends(where: $fellows_friends_where, sort: $fellows_friends_sort, pagination: $fellows_friends_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $fellows_friends_features_slice)',
        '    friends(where: $fellows_friends_friends_where, sort: $fellows_friends_friends_sort, pagination: $fellows_friends_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $fellows_friends_fellows_where, sort: $fellows_friends_fellows_sort, pagination: $fellows_friends_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $fellows_friends_children_where, sort: $fellows_friends_children_sort, pagination: $fellows_friends_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  fellows(where: $fellows_fellows_where, sort: $fellows_fellows_sort, pagination: $fellows_fellows_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $fellows_fellows_features_slice)',
        '    friends(where: $fellows_fellows_friends_where, sort: $fellows_fellows_friends_sort, pagination: $fellows_fellows_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $fellows_fellows_fellows_where, sort: $fellows_fellows_fellows_sort, pagination: $fellows_fellows_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $fellows_fellows_children_where, sort: $fellows_fellows_children_sort, pagination: $fellows_fellows_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  parent {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $fellows_parent_features_slice)',
        '    friends(where: $fellows_parent_friends_where, sort: $fellows_parent_friends_sort, pagination: $fellows_parent_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $fellows_parent_fellows_where, sort: $fellows_parent_fellows_sort, pagination: $fellows_parent_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $fellows_parent_children_where, sort: $fellows_parent_children_sort, pagination: $fellows_parent_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  children(where: $fellows_children_where, sort: $fellows_children_sort, pagination: $fellows_children_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $fellows_children_features_slice)',
        '    friends(where: $fellows_children_friends_where, sort: $fellows_children_friends_sort, pagination: $fellows_children_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $fellows_children_fellows_where, sort: $fellows_children_fellows_sort, pagination: $fellows_children_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $fellows_children_children_where, sort: $fellows_children_children_sort, pagination: $fellows_children_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '}',
        'parent {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  features(slice: $parent_features_slice)',
        '  fellows(where: $parent_fellows_where, sort: $parent_fellows_sort, pagination: $parent_fellows_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $parent_fellows_features_slice)',
        '    friends(where: $parent_fellows_friends_where, sort: $parent_fellows_friends_sort, pagination: $parent_fellows_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $parent_fellows_fellows_where, sort: $parent_fellows_fellows_sort, pagination: $parent_fellows_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $parent_fellows_children_where, sort: $parent_fellows_children_sort, pagination: $parent_fellows_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  parent {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $parent_parent_features_slice)',
        '    friends(where: $parent_parent_friends_where, sort: $parent_parent_friends_sort, pagination: $parent_parent_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $parent_parent_fellows_where, sort: $parent_parent_fellows_sort, pagination: $parent_parent_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $parent_parent_children_where, sort: $parent_parent_children_sort, pagination: $parent_parent_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '}',
        'children(where: $children_where, sort: $children_sort, pagination: $children_pagination) {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  features(slice: $children_features_slice)',
        '  fellows(where: $children_fellows_where, sort: $children_fellows_sort, pagination: $children_fellows_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $children_fellows_features_slice)',
        '    friends(where: $children_fellows_friends_where, sort: $children_fellows_friends_sort, pagination: $children_fellows_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $children_fellows_fellows_where, sort: $children_fellows_fellows_sort, pagination: $children_fellows_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $children_fellows_children_where, sort: $children_fellows_children_sort, pagination: $children_fellows_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '  children(where: $children_children_where, sort: $children_children_sort, pagination: $children_children_pagination) {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    features(slice: $children_children_features_slice)',
        '    friends(where: $children_children_friends_where, sort: $children_children_friends_sort, pagination: $children_children_friends_pagination) {',
        '      id',
        '    }',
        '    fellows(where: $children_children_fellows_where, sort: $children_children_fellows_sort, pagination: $children_children_fellows_pagination) {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children(where: $children_children_children_where, sort: $children_children_children_sort, pagination: $children_children_children_pagination) {',
        '      id',
        '    }',
        '  }',
        '}',
      ];

      const { fields: result } = composeFields(personConfig, generalConfig, options);
      expect(result).toEqual(expectedResult);
    });
  });
});
