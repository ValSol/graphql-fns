// @flow
import type { ThingConfig } from '../../flowTypes';

import composeDerivativeThingQuery from '../../utils/mergeDerivativeIntoCustom/composeDerivativeThingQuery';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeThingQueryArgs = (prefixName: string, thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(thingConfig, composeDerivativeThingQuery);

  const result = [`query ${prefixName}_${name}(${args1}) {`, `  ${name}(${args2}) {`];

  return result;
};

export default composeThingQueryArgs;
