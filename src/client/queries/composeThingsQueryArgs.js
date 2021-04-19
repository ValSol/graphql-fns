// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import composeDerivativeThingsQuery from '../../utils/mergeDerivativeIntoCustom/composeDerivativeThingsQuery';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeThingsQueryArgs = (prefixName: string, thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(thingConfig, composeDerivativeThingsQuery);

  return [`query ${prefixName}_${pluralize(name)}(${args1}) {`, `  ${pluralize(name)}(${args2}) {`];
};

export default composeThingsQueryArgs;
