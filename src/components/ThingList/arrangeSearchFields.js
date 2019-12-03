// @flow
import type { ThingConfig } from '../../flowTypes';

const arrangeSearchFields = (thingConfig: ThingConfig): Array<string> => {
  const { enumFields, textFields, fileFields } = thingConfig;

  const result = [];

  if (enumFields) {
    enumFields.reduce((prev, { name }) => {
      prev.push(name);
      return prev;
    }, result);
  }

  if (textFields) {
    textFields.reduce((prev, { name }) => {
      prev.push(name);
      return prev;
    }, result);
  }

  if (fileFields) {
    fileFields.reduce((prev, { name }) => {
      prev.push(name);
      return prev;
    }, result);
  }
  return result;
};

export default arrangeSearchFields;
