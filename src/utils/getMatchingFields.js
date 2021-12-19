// @flow

import type { ThingConfig } from '../flowTypes';

import composeFieldsObject from './composeFieldsObject';

const getMatchingFields = (config: ThingConfig, config2: ThingConfig): Array<string> => {
  const fieldsObject = composeFieldsObject(config);
  const fieldsObject2 = composeFieldsObject(config2);

  return Object.keys(fieldsObject).filter((fieldName) => fieldsObject2[fieldName]);
};

export default getMatchingFields;
