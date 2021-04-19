// @flow
import type { ThingConfig } from '../../flowTypes';

import composeDerivativeThingFilesQuery from '../../utils/mergeDerivativeIntoCustom/composeDerivativeThingFilesQuery';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeThingFilesQueryArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(thingConfig, composeDerivativeThingFilesQuery);
  const result = [`query ${prefixName}_${name}Files(${args1}) {`, `  ${name}Files(${args2}) {`];

  return result;
};

export default composeThingFilesQueryArgs;
