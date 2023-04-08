import type { EntityConfig, GeneralConfig, GqlActionData, GraphqlObject } from '../../tsTypes';

import composeMutation from '../../client/mutations/composeMutation';
import composeQuery from '../../client/queries/composeQuery';
import { string } from 'yup';

const composeGqlClientActionTree = (
  gqlActionData: GqlActionData,
  namePrefix: string,
  generalConfig: GeneralConfig,
  optionsArg: any = {},
): any => {
  const { actionType, actionName, entityName, composeOptions } = gqlActionData;
  const { allEntityConfigs } = generalConfig;

  const entityConfig = allEntityConfigs[entityName];

  const options = composeOptions(optionsArg);

  const args: [string, string, EntityConfig, GeneralConfig, GraphqlObject] = [
    namePrefix,
    actionName,
    entityConfig,
    generalConfig,
    options,
  ];

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
