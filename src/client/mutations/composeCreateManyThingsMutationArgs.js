// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import composeDerivativeCreateManyThingsMutation from '../../utils/mergeDerivativeIntoCustom/composeDerivativeCreateManyThingsMutation';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeCreateThingMutationArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(
    thingConfig,
    composeDerivativeCreateManyThingsMutation,
  );

  const result = [
    `mutation ${prefixName}_createMany${pluralize(name)}(${args1}) {`,
    `  createMany${pluralize(name)}(${args2}) {`,
  ];

  return result;
};

export default composeCreateThingMutationArgs;
