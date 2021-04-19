// @flow
import type { ThingConfig } from '../../flowTypes';

import composeDerivativeThingFileCountQuery from '../../utils/mergeDerivativeIntoCustom/composeDerivativeThingFileCountQuery';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeThingFileCountQueryArgs = (prefixName: string, thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(
    thingConfig,
    composeDerivativeThingFileCountQuery,
  );

  return `query ${prefixName}_${name}FileCount(${args1}) {
  ${name}FileCount(${args2})
}`;
};

export default composeThingFileCountQueryArgs;
