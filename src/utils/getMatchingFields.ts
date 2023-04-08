import type {EntityConfig} from '../tsTypes';

import composeFieldsObject from './composeFieldsObject';

const getMatchingFields = (config: EntityConfig, config2: EntityConfig): Array<string> => {
  const fieldsObject = composeFieldsObject(config);
  const fieldsObject2 = composeFieldsObject(config2);

  return Object.keys(fieldsObject).filter((fieldName) => fieldsObject2[fieldName]);
};

export default getMatchingFields;
