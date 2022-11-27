// @flow

import type { EntityConfig } from '../../flowTypes';

import rearrangeFilesArray from './rearrangeFilesArray';

const updateFileFieldsAfterUpload = (
  newFilesInArraysPositions: { [arrayFileFieldName: string]: Array<number> },
  values: Object,
  uploadedValues: Object,
  entityConfig: EntityConfig,
): {
  arrayFileFields?: { [arrayFileFieldName: string]: Array<Object> },
  scalarFileFields?: { [scalarFileFieldName: string]: Object },
} => {
  const { fileFields } = entityConfig;
  const result = {};
  if (!fileFields) return result;

  const arrayFileFields = Object.keys(newFilesInArraysPositions).reduce((prev, name) => {
    // eslint-disable-next-line no-param-reassign
    prev[name] = rearrangeFilesArray(
      newFilesInArraysPositions[name],
      values[name],
      uploadedValues[name],
    );

    return prev;
  }, {});

  if (Object.keys(arrayFileFields).length) {
    result.arrayFileFields = arrayFileFields;
  }

  const scalarFileFields = fileFields.reduce((prev, { name, array }) => {
    if (!array && uploadedValues[name]) {
      prev[name] = uploadedValues[name]; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});

  if (Object.keys(scalarFileFields).length) {
    result.scalarFileFields = scalarFileFields;
  }

  return result;
};
export default updateFileFieldsAfterUpload;
