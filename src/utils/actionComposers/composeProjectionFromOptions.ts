import type { TangibleEntityConfig, GeneralConfig, GqlActionData } from '../../tsTypes';

import composeFieldsObject from '../composeFieldsObject';

type Result = {
  [fieldName: string]: 1;
};

const composeProjectionFromOptions = (
  gqlActionData: GqlActionData,
  generalConfig: GeneralConfig,
  optionsArg: any = {},
): Result => {
  const { entityName, composeOptions } = gqlActionData;
  const { allEntityConfigs } = generalConfig;

  const entityConfig = allEntityConfigs[entityName];

  const { counter } = entityConfig as TangibleEntityConfig;

  const { include, exclude } = composeOptions(optionsArg);

  const entityObject = composeFieldsObject(allEntityConfigs[entityName]);

  const defaultFields = counter
    ? ['counter', 'createdAt', 'updatedAt']
    : ['createdAt', 'updatedAt'];

  const result = [...defaultFields, ...Object.keys(entityObject)].reduce<Record<string, any>>(
    (prev, fieldName) => {
      if (!include && !exclude) {
        prev[fieldName] = 1; // eslint-disable-line no-param-reassign
      }

      if (include && include[fieldName] && (!exclude || (exclude && !exclude[fieldName]))) {
        prev[fieldName] = 1; // eslint-disable-line no-param-reassign
      }

      if (!include && exclude && !exclude[fieldName]) {
        prev[fieldName] = 1; // eslint-disable-line no-param-reassign
      }
      return prev;
    },
    {},
  );

  result._id = 1; // eslint-disable-line no-underscore-dangle

  return result;
};

export default composeProjectionFromOptions;
