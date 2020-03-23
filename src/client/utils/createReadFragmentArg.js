// @flow

import { defaultDataIdFromObject } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';

import type { ClientOptions, ThingConfig } from '../../flowTypes';

import composeFrgament from '../fragment/composeFragment';

const createReadFragmentArg = (
  id: string,
  thingConfig: ThingConfig,
  clientOptions: ClientOptions = {},
  dataIdFromObject: (Object) => string = defaultDataIdFromObject,
  customDataIdFromObjectArg?: Object,
): Object | null => {
  const { name } = thingConfig;

  const fragment = gql(composeFrgament(thingConfig, clientOptions));

  const argObj = customDataIdFromObjectArg || { __typename: name, id };
  const dataId = dataIdFromObject(argObj);

  return { id: dataId, fragment };
};

export default createReadFragmentArg;
