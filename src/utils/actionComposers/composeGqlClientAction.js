// @flow

import { gql } from '@apollo/client';

import type { GeneralConfig, GqlActionData } from '../../flowTypes';

import composeMutation from '../../client/mutations/composeMutation';
import composeQuery from '../../client/queries/composeQuery';

const composeGqlClientAction = (
  gqlActionData: GqlActionData,
  namePrefix: string,
  generalConfig: GeneralConfig,
  optionsArg?: Object = {},
): Object => {
  const { actionType, actionName, thingName, composeOptions } = gqlActionData;
  const { thingConfigs } = generalConfig;

  const thingConfig = thingConfigs[thingName];

  const options = composeOptions(optionsArg);

  const args = [namePrefix, actionName, thingConfig, generalConfig, options];

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
