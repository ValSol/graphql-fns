import type { DuplexField, GraphqlObject, RelationalField, TangibleEntityConfig } from '@/tsTypes';

import composeFieldsObject, { FOR_MONGO_QUERY } from '@/utils/composeFieldsObject';

const composeRelationalKey = (
  value: GraphqlObject,
  lookupArray: Array<string>,
  entityConfig: TangibleEntityConfig,
): {
  relationalKey: string;
  entityConfig: TangibleEntityConfig;
  value: GraphqlObject;
} => {
  let currentValue: GraphqlObject = value;
  let currentConfig = entityConfig;
  let relationalKey = '';
  let goToNext = true;

  while (goToNext) {
    const keys = Object.keys(currentValue).filter((key) => key.endsWith('_'));
    const [key] = keys;
    if (key?.endsWith('_')) {
      if (keys.length > 1) {
        throw new TypeError(`keys length must be "1" but "${keys.length}"!`);
      }

      const fieldName = key.slice(0, -1);
      const { fieldsObject } = composeFieldsObject(currentConfig, FOR_MONGO_QUERY);

      const attributes = fieldsObject[fieldName];

      if (!(attributes as DuplexField | RelationalField).config) {
        throw new TypeError(`Field "${fieldName}" must has attr "config"!`);
      }

      currentConfig = (attributes as DuplexField | RelationalField).config;

      const parentRelationalOppositeName =
        attributes.type === 'relationalFields' && attributes.parent
          ? `:${attributes.oppositeName}`
          : '';

      const lookupArrayItem = `${relationalKey}:${key}:${currentConfig.name}${parentRelationalOppositeName}`;

      if (!lookupArray.includes(lookupArrayItem)) {
        lookupArray.push(lookupArrayItem);
      }

      currentValue = currentValue[key] as GraphqlObject;
      relationalKey += key;
    } else {
      goToNext = false;
    }
  }

  return {
    relationalKey,
    entityConfig: currentConfig,
    value: currentValue,
  };
};

export default composeRelationalKey;
