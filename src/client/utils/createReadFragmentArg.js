// @flow

import { defaultDataIdFromObject } from '@apollo/client/cache';
import { gql } from '@apollo/client';

import type { ClientOptions, GeneralConfig, ThingConfig } from '../../flowTypes';

import composeFrgament from '../fragment/composeFragment';

const createReadFragmentArg = (
  id: string,
  fragmentName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
  dataIdFromObject: (Object) => string = defaultDataIdFromObject,
  customDataIdFromObjectArg?: Object,
): Object | null => {
  const { name } = thingConfig;

  const fragment = gql(composeFrgament(fragmentName, thingConfig, generalConfig, clientOptions));

  const argObj = customDataIdFromObjectArg || { __typename: name, id };
  const dataId = dataIdFromObject(argObj);

  return { id: dataId, fragment };
};

export default createReadFragmentArg;
