// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import composeDerivativeImportThingsMutation from '../../utils/mergeDerivativeIntoCustom/composeDerivativeImportThingsMutation';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeImportThingsMutationArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(
    thingConfig,
    composeDerivativeImportThingsMutation,
  );

  const result = [
    `mutation ${prefixName}_import${pluralize(name)}(${args1}) {`,
    `  import${pluralize(name)}(${args2}) {`,
  ];

  return result;
};

export default composeImportThingsMutationArgs;
