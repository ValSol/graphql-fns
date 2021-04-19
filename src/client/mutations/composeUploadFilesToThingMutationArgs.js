// @flow
import type { ThingConfig } from '../../flowTypes';

import composeDerivativeUploadFilesToThingMutation from '../../utils/mergeDerivativeIntoCustom/composeDerivativeUploadFilesToThingMutation';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeUploadFilesToThingMutationResolver = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(
    thingConfig,
    composeDerivativeUploadFilesToThingMutation,
  );

  const result = [
    `mutation ${prefixName}_uploadFilesTo${name}(${args1}) {`,
    `  uploadFilesTo${name}(${args2}) {`,
  ];

  return result;
};

export default composeUploadFilesToThingMutationResolver;
