// @flow
import type { ThingConfig } from '../../flowTypes';

import composeDerivativeThingCountQuery from '../../utils/mergeDerivativeIntoCustom/composeDerivativeThingCountQuery';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeThingCountQueryArgs = (prefixName: string, thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(thingConfig, composeDerivativeThingCountQuery);

  return `query ${prefixName}_${name}Count(${args1}) {
  ${name}Count(${args2})
}`;
};

export default composeThingCountQueryArgs;
