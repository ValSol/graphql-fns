import type { DuplexField, RelationalField, TangibleEntityConfig } from '@/tsTypes';

import composeFieldsObject, { FOR_MONGO_QUERY } from '@/utils/composeFieldsObject';

// one level of a relational filter "x_": registers the lookup of the linked entity and returns the key
// of the lookup result and the config of the linked entity; the value of "x_" (its own fields and
// nested "y_" filters) is composed by the caller, so no condition of a level is lost
const composeRelationalKey = (
  key: string,
  parentRelationalKey: string,
  lookupArray: Array<string>,
  entityConfig: TangibleEntityConfig,
): {
  relationalKey: string;
  entityConfig: TangibleEntityConfig;
} => {
  const fieldName = key.slice(0, -1);
  const { fieldsObject } = composeFieldsObject(entityConfig, FOR_MONGO_QUERY);

  const attributes = fieldsObject[fieldName];

  if (!(attributes as DuplexField | RelationalField | undefined)?.config) {
    throw new TypeError(`Field "${fieldName}" must has attr "config"!`);
  }

  const { config } = attributes as DuplexField | RelationalField;

  const parentRelationalOppositeName =
    attributes.type === 'relationalFields' && attributes.parent
      ? `:${attributes.oppositeName}`
      : '';

  const lookupArrayItem = `${parentRelationalKey}:${key}:${config.name}${parentRelationalOppositeName}`;

  if (!lookupArray.includes(lookupArrayItem)) {
    lookupArray.push(lookupArrayItem);
  }

  return { relationalKey: `${parentRelationalKey}${key}`, entityConfig: config };
};

export default composeRelationalKey;
