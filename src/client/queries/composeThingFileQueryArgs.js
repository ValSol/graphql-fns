// @flow
import type { ThingConfig } from '../../flowTypes';

import composeDerivativeThingFileQuery from '../../utils/mergeDerivativeIntoCustom/composeDerivativeThingFileQuery';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeThingFileQueryArgs = (prefixName: string, thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(thingConfig, composeDerivativeThingFileQuery);

  const result = [`query ${prefixName}_${name}File(${args1}) {`, `  ${name}File(${args2}) {`];

  return result;
};

export default composeThingFileQueryArgs;
