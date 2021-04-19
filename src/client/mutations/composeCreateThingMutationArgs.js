// @flow
import type { ThingConfig } from '../../flowTypes';

import composeDerivativeCreateThingMutation from '../../utils/mergeDerivativeIntoCustom/composeDerivativeCreateThingMutation';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeCreateThingMutationArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(
    thingConfig,
    composeDerivativeCreateThingMutation,
  );

  const result = [
    `mutation ${prefixName}_create${name}(${args1}) {`,
    `  create${name}(${args2}) {`,
  ];

  return result;
};

export default composeCreateThingMutationArgs;
