import {defaultDataIdFromObject} from '@apollo/client/cache';
import { gql } from '@apollo/client';

import type { ClientOptions, GeneralConfig, EntityConfig } from '../../tsTypes';

import composeFrgament from '../fragment/composeFragment';

const createReadFragmentArg = (
  id: string,
  fragmentName: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  clientOptions: ClientOptions = {},
  dataIdFromObject: (arg1: any) => string = defaultDataIdFromObject,
  customDataIdFromObjectArg?: any,
): any | null => {
  const { name } = entityConfig;

  const fragment = gql(composeFrgament(fragmentName, entityConfig, generalConfig, clientOptions));

  const argObj = customDataIdFromObjectArg || { __typename: name, id };
  const dataId = dataIdFromObject(argObj);

  return { id: dataId, fragment };
};

export default createReadFragmentArg;
