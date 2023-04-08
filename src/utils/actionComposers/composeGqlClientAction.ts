import { gql } from '@apollo/client';

import type { EntityConfig, GeneralConfig, GqlActionData, GraphqlObject } from '../../tsTypes';

import composeMutation from '../../client/mutations/composeMutation';
import composeQuery from '../../client/queries/composeQuery';

const composeGqlClientAction = (
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

  switch (actionType) {
    case 'Query': {
      const query = composeQuery(...args);
      return gql(query);
    }

    case 'Mutation': {
      const mutation = composeMutation(...args);
      return gql(mutation);
    }

    default:
      throw new TypeError(`Incorrect actionType: "${actionType}"`);
  }
};

export default composeGqlClientAction;
