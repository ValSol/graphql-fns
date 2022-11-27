// @flow

import type { GeneralConfig, GqlActionData } from '../../flowTypes';

import composeFieldsObject from '../composeFieldsObject';

type Result = { [fieldName: string]: 1 };

const composeProjectionFromOptions = (
  gqlActionData: GqlActionData,
  generalConfig: GeneralConfig,
  optionsArg?: Object = {},
): Result => {
  const { entityName, composeOptions } = gqlActionData;
  const { entityConfigs } = generalConfig;

  const entityConfig = entityConfigs[entityName];

  const { counter } = entityConfig;

  const { include, exclude } = composeOptions(optionsArg);

  const entityObject = composeFieldsObject(entityConfigs[entityName]);

  const defaultFields = counter
    ? ['counter', 'createdAt', 'updatedAt']
    : ['createdAt', 'updatedAt'];

  const result = [...defaultFields, ...Object.keys(entityObject)].reduce((prev, fieldName) => {
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
  }, {});

  result._id = 1; // eslint-disable-line no-underscore-dangle

  return result;
};

export default composeProjectionFromOptions;
