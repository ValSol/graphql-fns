// @flow

import type { GeneralConfig, GqlActionData } from '../../flowTypes';

import composeMutation from '../../client/mutations/composeMutation';
import composeQuery from '../../client/queries/composeQuery';

const composeGqlClientActionTree = (
  gqlActionData: GqlActionData,
  namePrefix: string,
  generalConfig: GeneralConfig,
  optionsArg?: Object = {},
): Object => {
  const { actionType, actionName, entityName, composeOptions } = gqlActionData;
  const { entityConfigs } = generalConfig;

  const entityConfig = entityConfigs[entityName];

  const options = composeOptions(optionsArg);

  const args = [namePrefix, actionName, entityConfig, generalConfig, options];

  let content = '';

  switch (actionType) {
    case 'Query': {
      content = composeQuery(...args);
      break;
    }

    case 'Mutation': {
      content = composeMutation(...args);
      break;
    }

    default:
      throw new TypeError(`Incorrect actionType: "${actionType}"`);
  }

  const [, secondToken] = content.split(' ');
  const [name] = secondToken.split('(');

  return { name, content };
};

export default composeGqlClientActionTree;
