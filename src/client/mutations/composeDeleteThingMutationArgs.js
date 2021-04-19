// @flow
import type { ThingConfig } from '../../flowTypes';

import composeDerivativeDeleteThingMutation from '../../utils/mergeDerivativeIntoCustom/composeDerivativeDeleteThingMutation';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeDeleteThingMutationArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(
    thingConfig,
    composeDerivativeDeleteThingMutation,
  );

  const result = [
    `mutation ${prefixName}_delete${name}(${args1}) {`,
    `  delete${name}(${args2}) {`,
  ];

  return result;
};

export default composeDeleteThingMutationArgs;
