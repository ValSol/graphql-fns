import type { EntityConfig } from '../../../tsTypes';

type Result = {
  boolean: Array<string>;
  float: Array<string>;
  int: Array<string>;
  object: Array<string>;
};

const allocateFieldsForCSV = (entityConfig: EntityConfig): Result => {
  const {
    booleanFields = [],
    dateTimeFields = [],
    embeddedFields = [],
    enumFields = [],
    geospatialFields = [],
    fileFields = [],
    floatFields = [],
    intFields = [],
    textFields = [],
    type: entityType,
  } = entityConfig;

  const result = { boolean: [], float: [], int: [], object: [] };

  booleanFields.forEach(({ name, array }) => {
    if (array) {
      result.object.push(name);
    } else {
      result.boolean.push(name);
    }
  });

  dateTimeFields.forEach(({ name, array }) => {
    if (array) {
      result.object.push(name);
    }
  });

  embeddedFields.forEach(({ name }) => {
    result.object.push(name);
  });

  // the same code as for embeddedFields
  fileFields.forEach(({ name }) => {
    result.object.push(name);
  });

  enumFields.forEach(({ name, array }) => {
    if (array) {
      result.object.push(name);
    }
  });

  geospatialFields.forEach(({ name }) => {
    result.object.push(name);
  });

  floatFields.forEach(({ name, array }) => {
    if (array) {
      result.object.push(name);
    } else {
      result.float.push(name);
    }
  });

  intFields.forEach(({ name, array }) => {
    if (array) {
      result.object.push(name);
    } else {
      result.int.push(name);
    }
  });

  textFields.forEach(({ name, array }) => {
    if (array) {
      result.object.push(name);
    }
  });

  if (entityType === 'tangible') {
    const { duplexFields = [], relationalFields = [] } = entityConfig;

    duplexFields.forEach(({ name }) => {
      result.object.push(name);
    });

    relationalFields
      .filter(({ parent }) => !parent)
      .forEach(({ name }) => {
        result.object.push(name);
      });
  }

  return result;
};

export default allocateFieldsForCSV;
