// @flow
import type { ThingConfig } from '../../flowTypes';

import composeDerivativePushIntoThingMutation from '../../utils/mergeDerivativeIntoCustom/composeDerivativePushIntoThingMutation';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composePushIntoThingMutationArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(
    thingConfig,
    composeDerivativePushIntoThingMutation,
  );

  const result = [
    `mutation ${prefixName}_pushInto${name}(${args1}) {`,
    `  pushInto${name}(${args2}) {`,
  ];

  return result;
};

export default composePushIntoThingMutationArgs;
