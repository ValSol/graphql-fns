// @flow

import type { ThingConfig } from '../../../flowTypes';

type Result = {
  boolean: Array<string>,
  float: Array<string>,
  int: Array<string>,
  object: Array<string>,
};

const allocateFieldsForCSV = (thingConfig: ThingConfig): Result => {
  const {
    booleanFields,
    dateTimeFields,
    duplexFields,
    embeddedFields,
    enumFields,
    geospatialFields,
    fileFields,
    floatFields,
    intFields,
    relationalFields,
    textFields,
  } = thingConfig;

  const result = { boolean: [], float: [], int: [], object: [] };

  if (booleanFields) {
    booleanFields.forEach(({ name, array }) => {
      if (array) {
        result.object.push(name);
      } else {
        result.boolean.push(name);
      }
    });
  }

  if (duplexFields) {
    duplexFields.forEach(({ name, array }) => {
      if (array) {
        result.object.push(name);
      }
    });
  }

  if (dateTimeFields) {
    dateTimeFields.forEach(({ name, array }) => {
      if (array) {
        result.object.push(name);
      }
    });
  }

  if (embeddedFields) {
    embeddedFields.forEach(({ name }) => {
      result.object.push(name);
    });
  }

  // the same code as for embeddedFields
  if (fileFields) {
    fileFields.forEach(({ name }) => {
      result.object.push(name);
    });
  }

  if (enumFields) {
    enumFields.forEach(({ name, array }) => {
      if (array) {
        result.object.push(name);
      }
    });
  }

  if (geospatialFields) {
    geospatialFields.forEach(({ name }) => {
      result.object.push(name);
    });
  }

  if (floatFields) {
    floatFields.forEach(({ name, array }) => {
      if (array) {
        result.object.push(name);
      } else {
        result.float.push(name);
      }
    });
  }

  if (intFields) {
    intFields.forEach(({ name, array }) => {
      if (array) {
        result.object.push(name);
      } else {
        result.int.push(name);
      }
    });
  }

  if (relationalFields) {
    relationalFields.forEach(({ name, array }) => {
      if (array) {
        result.object.push(name);
      }
    });
  }

  if (textFields) {
    textFields.forEach(({ name, array }) => {
      if (array) {
        result.object.push(name);
      }
    });
  }

  return result;
};

export default allocateFieldsForCSV;
