import type { EntityConfig, TangibleEntityConfig } from '@/tsTypes';

import composeFieldsObject from './composeFieldsObject';

// fields that "copy…" mutations copy: common fields that are stored, so without calculated fields
const getMatchingFields = (config: EntityConfig, config2: EntityConfig): Array<string> => {
  const { fieldsObject } = composeFieldsObject(config);
  const { fieldsObject: fieldsObject2 } = composeFieldsObject(config2);

  const calculatedFieldNames = [config, config2].flatMap(
    ({ calculatedFields = [] }: TangibleEntityConfig) => calculatedFields.map(({ name }) => name),
  );

  return Object.keys(fieldsObject).filter(
    (fieldName) => fieldsObject2[fieldName] && !calculatedFieldNames.includes(fieldName),
  );
};

export default getMatchingFields;
