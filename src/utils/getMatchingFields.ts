import type { EntityConfig, TangibleEntityConfig } from '@/tsTypes';

import composeFieldsObject from './composeFieldsObject';

const getMatchingFields = (
  config: EntityConfig,
  config2: EntityConfig,
  withoutCalculated = false, // calculated fields are not stored, so resolvers never fetch or copy them
): Array<string> => {
  const { fieldsObject } = composeFieldsObject(config);
  const { fieldsObject: fieldsObject2 } = composeFieldsObject(config2);

  const calculatedFieldNames = withoutCalculated
    ? [config, config2].flatMap(({ calculatedFields = [] }: TangibleEntityConfig) =>
        calculatedFields.map(({ name }) => name),
      )
    : [];

  return Object.keys(fieldsObject).filter(
    (fieldName) => fieldsObject2[fieldName] && !calculatedFieldNames.includes(fieldName),
  );
};

export default getMatchingFields;
