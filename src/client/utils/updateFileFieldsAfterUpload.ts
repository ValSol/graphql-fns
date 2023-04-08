import type {EntityConfig} from '../../tsTypes';

import rearrangeFilesArray from './rearrangeFilesArray';

const updateFileFieldsAfterUpload = (
  newFilesInArraysPositions: {
    [arrayFileFieldName: string]: Array<number>
  },
  values: any,
  uploadedValues: any,
  entityConfig: EntityConfig,
): {
  arrayFileFields?: {
    [arrayFileFieldName: string]: Array<any>
  },
  scalarFileFields?: {
    [scalarFileFieldName: string]: any
  }
} => {
  const { fileFields } = entityConfig;
  const result: Record<string, any> = {};
  if (!fileFields) return result;

  const arrayFileFields = Object.keys(newFilesInArraysPositions).reduce<Record<string, any>>((prev, name) => {
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

  const scalarFileFields = fileFields.reduce<Record<string, any>>((prev, { name, array }) => {
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
