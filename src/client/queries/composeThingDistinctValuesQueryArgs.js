// @flow
import type { ThingConfig } from '../../flowTypes';

import composeDerivativeThingDistinctValuesQueryArgs from '../../utils/mergeDerivativeIntoCustom/composeDerivativeThingDistinctValuesQuery';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeThingDistinctValuesQueryArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
): string => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(
    thingConfig,
    composeDerivativeThingDistinctValuesQueryArgs,
  );

  return `query ${prefixName}_${name}DistinctValues(${args1}) {
  ${name}DistinctValues(${args2})
}`;
};

export default composeThingDistinctValuesQueryArgs;
