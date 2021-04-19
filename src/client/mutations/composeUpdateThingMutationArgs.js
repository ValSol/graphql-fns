// @flow
import type { ThingConfig } from '../../flowTypes';

import composeDerivativeUpdateThingMutation from '../../utils/mergeDerivativeIntoCustom/composeDerivativeUpdateThingMutation';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeUpdateThingMutationArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(
    thingConfig,
    composeDerivativeUpdateThingMutation,
  );

  const result = [
    `mutation ${prefixName}_update${name}(${args1}) {`,
    `  update${name}(${args2}) {`,
  ];

  return result;
};

export default composeUpdateThingMutationArgs;
