// @flow

import { defaultDataIdFromObject } from '@apollo/client/cache';
import { gql } from '@apollo/client';

import type { ClientOptions, GeneralConfig, EntityConfig } from '../../flowTypes';

import composeFrgament from '../fragment/composeFragment';

const createReadFragmentArg = (
  id: string,
  fragmentName: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
  dataIdFromObject: (Object) => string = defaultDataIdFromObject,
  customDataIdFromObjectArg?: Object,
): Object | null => {
  const { name } = entityConfig;

  const fragment = gql(composeFrgament(fragmentName, entityConfig, generalConfig, clientOptions));

  const argObj = customDataIdFromObjectArg || { __typename: name, id };
  const dataId = dataIdFromObject(argObj);

  return { id: dataId, fragment };
};

export default createReadFragmentArg;
