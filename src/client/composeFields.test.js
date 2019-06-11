// @flow
/* eslint-env jest */
import type { ThingConfig, ClientFieldsOptions } from '../flowTypes';

const composeFields = require('./composeFields');

describe('composeFields', () => {
  describe('not nested fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
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

    test('should compose not nested fields with shift = 0', () => {
      const options: ClientFieldsOptions = { shift: 0 };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'textField',
        'dateTimeField',
        'intField',
        'floatField',
        'booleanField',
        'enumField',
        'geospatialPoint {',
        '  longitude',
        '  latitude',
        '}',
        'geospatialPolygon {',
        '  externalRing {',
        '    ring {',
        '      longitude',
        '      latitude',
        '    }',
        '  }',
        '  internalRings {',
        '    ring {',
        '      longitude',
        '      latitude',
        '    }',
        '  }',
        '}',
      ];

      const result = composeFields(thingConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with shift = 1', () => {
      const options: ClientFieldsOptions = { shift: 1 };
      const expectedResult = [
        '  id',
        '  createdAt',
        '  updatedAt',
        '  textField',
        '  dateTimeField',
        '  intField',
        '  floatField',
        '  booleanField',
        '  enumField',
        '  geospatialPoint {',
        '    longitude',
        '    latitude',
        '  }',
        '  geospatialPolygon {',
        '    externalRing {',
        '      ring {',
        '        longitude',
        '        latitude',
        '      }',
        '    }',
        '    internalRings {',
        '      ring {',
        '        longitude',
        '        latitude',
        '      }',
        '    }',
        '  }',
      ];

      const result = composeFields(thingConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with include option 1', () => {
      const include = {
        textField: null,
        intField: null,
        geospatialPoint: { longitude: null },
        geospatialPolygon: { externalRing: { ring: { longitude: null } } },
      };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'textField',
        'intField',
        'geospatialPoint {',
        '  longitude',
        '}',
        'geospatialPolygon {',
        '  externalRing {',
        '    ring {',
        '      longitude',
        '    }',
        '  }',
        '}',
      ];

      const result = composeFields(thingConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with exclude option 1', () => {
      const exclude = {
        textField: null,
        intField: null,
        geospatialPoint: { longitude: null },
        geospatialPolygon: { externalRing: { ring: { longitude: null } } },
      };
      const options: ClientFieldsOptions = { shift: 0, exclude };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'dateTimeField',
        'floatField',
        'booleanField',
        'enumField',
        'geospatialPoint {',
        '  latitude',
        '}',
        'geospatialPolygon {',
        '  externalRing {',
        '    ring {',
        '      latitude',
        '    }',
        '  }',
        '  internalRings {',
        '    ring {',
        '      longitude',
        '      latitude',
        '    }',
        '  }',
        '}',
      ];

      const result = composeFields(thingConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with exclude option 2', () => {
      const exclude = {
        textField: null,
        intField: null,
        geospatialPoint: { longitude: null },
        geospatialPolygon: { externalRing: { ring: null } },
      };
      const options: ClientFieldsOptions = { shift: 0, exclude };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'dateTimeField',
        'floatField',
        'booleanField',
        'enumField',
        'geospatialPoint {',
        '  latitude',
        '}',
        'geospatialPolygon {',
        '  internalRings {',
        '    ring {',
        '      longitude',
        '      latitude',
        '    }',
        '  }',
        '}',
      ];

      const result = composeFields(thingConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with exclude option 3', () => {
      const exclude = {
        textField: null,
        intField: null,
        geospatialPoint: { longitude: null },
        geospatialPolygon: { externalRing: null },
      };
      const options: ClientFieldsOptions = { shift: 0, exclude };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'dateTimeField',
        'floatField',
        'booleanField',
        'enumField',
        'geospatialPoint {',
        '  latitude',
        '}',
        'geospatialPolygon {',
        '  internalRings {',
        '    ring {',
        '      longitude',
        '      latitude',
        '    }',
        '  }',
        '}',
      ];

      const result = composeFields(thingConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with include option 2', () => {
      const include = {
        textField: null,
        intField: null,
        geospatialPoint: { longitude: null },
        geospatialPolygon: { internalRings: { ring: { longitude: null } } },
      };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'textField',
        'intField',
        'geospatialPoint {',
        '  longitude',
        '}',
        'geospatialPolygon {',
        '  internalRings {',
        '    ring {',
        '      longitude',
        '    }',
        '  }',
        '}',
      ];

      const result = composeFields(thingConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with include option 3', () => {
      const include = {
        textField: null,
        intField: null,
        geospatialPoint: { longitude: null },
        geospatialPolygon: { externalRing: { ring: null } },
      };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'textField',
        'intField',
        'geospatialPoint {',
        '  longitude',
        '}',
        'geospatialPolygon {',
        '  externalRing {',
        '    ring {',
        '      longitude',
        '      latitude',
        '    }',
        '  }',
        '}',
      ];

      const result = composeFields(thingConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose not nested fields with include option 4', () => {
      const include = {
        textField: null,
        intField: null,
        geospatialPoint: { longitude: null },
        geospatialPolygon: { externalRing: null },
      };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'textField',
        'intField',
        'geospatialPoint {',
        '  longitude',
        '}',
        'geospatialPolygon {',
        '  externalRing {',
        '    ring {',
        '      longitude',
        '      latitude',
        '    }',
        '  }',
        '}',
      ];

      const result = composeFields(thingConfig, options);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Embedded fields', () => {
    const embedded3Config: ThingConfig = {
      name: 'Embedded3',
      embedded: true,
      textFields: [
        {
          name: 'textField3',
        },
      ],
    };

    const embedded2Config: ThingConfig = {
      name: 'Embedded2',
      embedded: true,
      textFields: [
        {
          name: 'textField2',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField3',
          config: embedded3Config,
        },
      ],
    };

    const embedded1Config: ThingConfig = {
      name: 'Embedded1',
      embedded: true,
      textFields: [
        {
          name: 'textField1',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField2',
          config: embedded2Config,
        },
      ],
    };

    const exampleConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField1',
          config: embedded1Config,
        },
      ],
    };

    test('should compose embedded fields', () => {
      const options: ClientFieldsOptions = { shift: 0 };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'textField',
        'embeddedField1 {',
        '  textField1',
        '  embeddedField2 {',
        '    textField2',
        '    embeddedField3 {',
        '      textField3',
        '    }',
        '  }',
        '}',
      ];

      const result = composeFields(exampleConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with include option 1', () => {
      const include = { textField: null };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = ['textField'];

      const result = composeFields(exampleConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with include option 2', () => {
      const include = { embeddedField1: null };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'embeddedField1 {',
        '  textField1',
        '  embeddedField2 {',
        '    textField2',
        '    embeddedField3 {',
        '      textField3',
        '    }',
        '  }',
        '}',
      ];

      const result = composeFields(exampleConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with include option 3', () => {
      const include = { embeddedField1: { textField1: null } };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = ['embeddedField1 {', '  textField1', '}'];

      const result = composeFields(exampleConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with include option 4', () => {
      const include = { embeddedField1: { embeddedField2: { textField2: null } } };
      const options: ClientFieldsOptions = { shift: 0, include };
      const expectedResult = [
        'embeddedField1 {',
        '  embeddedField2 {',
        '    textField2',
        '  }',
        '}',
      ];

      const result = composeFields(exampleConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with exclude option 1', () => {
      const exclude = { embeddedField1: null };
      const options: ClientFieldsOptions = { shift: 0, exclude };
      const expectedResult = ['id', 'createdAt', 'updatedAt', 'textField'];

      const result = composeFields(exampleConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with exclude option 2', () => {
      const exclude = { embeddedField1: { embeddedField2: null } };
      const options: ClientFieldsOptions = { shift: 0, exclude };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'textField',
        'embeddedField1 {',
        '  textField1',
        '}',
      ];

      const result = composeFields(exampleConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose embedded fields with exclude option 3', () => {
      const exclude = { embeddedField1: { embeddedField2: { embeddedField3: null } } };
      const options: ClientFieldsOptions = { shift: 0, exclude };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'textField',
        'embeddedField1 {',
        '  textField1',
        '  embeddedField2 {',
        '    textField2',
        '  }',
        '}',
      ];

      const result = composeFields(exampleConfig, options);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Relatioanl and duplex fields', () => {
    const personConfig: ThingConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
        },
        {
          name: 'secondName',
        },
      ],
      relationalFields: [
        {
          name: 'friends',
          array: true,
          config: personConfig,
        },
      ],
      duplexFields: [
        {
          name: 'parent',
          config: personConfig,
          oppositeName: 'children',
        },
        {
          name: 'children',
          array: true,
          config: personConfig,
          oppositeName: 'parent',
        },
      ],
    });

    test('should compose relatioanl and duplex fields without depth', () => {
      const options: ClientFieldsOptions = { shift: 0 };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'firstName',
        'secondName',
        'friends {',
        '  id',
        '}',
        'parent {',
        '  id',
        '}',
        'children {',
        '  id',
        '}',
      ];

      const result = composeFields(personConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose relatioanl and duplex fields with depth: 0', () => {
      const options: ClientFieldsOptions = { shift: 0, depth: 0 };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'firstName',
        'secondName',
        'friends {',
        '  id',
        '}',
        'parent {',
        '  id',
        '}',
        'children {',
        '  id',
        '}',
      ];

      const result = composeFields(personConfig, options);
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
        'friends {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  friends {',
        '    id',
        '  }',
        '  parent {',
        '    id',
        '  }',
        '  children {',
        '    id',
        '  }',
        '}',
        'parent {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  friends {',
        '    id',
        '  }',
        '  parent {',
        '    id',
        '  }',
        '  children {',
        '    id',
        '  }',
        '}',
        'children {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  friends {',
        '    id',
        '  }',
        '  parent {',
        '    id',
        '  }',
        '  children {',
        '    id',
        '  }',
        '}',
      ];

      const result = composeFields(personConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose relatioanl and duplex fields with depth: 2', () => {
      const options: ClientFieldsOptions = { shift: 0, depth: 2 };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'firstName',
        'secondName',
        'friends {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  friends {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
        '      id',
        '    }',
        '  }',
        '  parent {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
        '      id',
        '    }',
        '  }',
        '  children {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
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
        '  friends {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
        '      id',
        '    }',
        '  }',
        '  parent {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
        '      id',
        '    }',
        '  }',
        '  children {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
        '      id',
        '    }',
        '  }',
        '}',
        'children {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  friends {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
        '      id',
        '    }',
        '  }',
        '  parent {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
        '      id',
        '    }',
        '  }',
        '  children {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
        '      id',
        '    }',
        '  }',
        '}',
      ];

      const result = composeFields(personConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose relatioanl and duplex fields with depth: 0 & include option 1', () => {
      const include = {
        id: null,
        friends: null,
        parent: null,
      };
      const options: ClientFieldsOptions = { shift: 0, depth: 0, include };
      const expectedResult = ['id', 'friends {', '  id', '}', 'parent {', '  id', '}'];

      const result = composeFields(personConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose relatioanl and duplex fields with depth: 2 & include option 1', () => {
      const include = {
        id: null,
        friends: { id: null },
        parent: { firstName: null },
        children: { secondName: null },
      };
      const options: ClientFieldsOptions = { shift: 0, depth: 2, include };
      const expectedResult = [
        'id',
        'friends {',
        '  id',
        '}',
        'parent {',
        '  firstName',
        '}',
        'children {',
        '  secondName',
        '}',
      ];

      const result = composeFields(personConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose relatioanl and duplex fields with depth: 2 & include option 2', () => {
      const include = {
        id: null,
        friends: { id: null, friends: null },
        parent: { firstName: null, parent: null },
        children: { secondName: null, children: null },
      };
      const options: ClientFieldsOptions = { shift: 0, depth: 2, include };
      const expectedResult = [
        'id',
        'friends {',
        '  id',
        '  friends {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
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
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
        '      id',
        '    }',
        '  }',
        '}',
        'children {',
        '  secondName',
        '  children {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
        '      id',
        '    }',
        '  }',
        '}',
      ];

      const result = composeFields(personConfig, options);
      expect(result).toEqual(expectedResult);
    });

    test('should compose relatioanl and duplex fields with depth: 2 & exclude option', () => {
      const exclude = {
        friends: { parent: null, children: null },
        parent: { friends: null, children: null },
        children: { friends: null, parent: null },
      };
      const options: ClientFieldsOptions = { shift: 0, depth: 2, exclude };
      const expectedResult = [
        'id',
        'createdAt',
        'updatedAt',
        'firstName',
        'secondName',
        'friends {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  friends {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
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
        '  parent {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
        '      id',
        '    }',
        '  }',
        '}',
        'children {',
        '  id',
        '  createdAt',
        '  updatedAt',
        '  firstName',
        '  secondName',
        '  children {',
        '    id',
        '    createdAt',
        '    updatedAt',
        '    firstName',
        '    secondName',
        '    friends {',
        '      id',
        '    }',
        '    parent {',
        '      id',
        '    }',
        '    children {',
        '      id',
        '    }',
        '  }',
        '}',
      ];

      const result = composeFields(personConfig, options);
      expect(result).toEqual(expectedResult);
    });
  });
});
