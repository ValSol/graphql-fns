// @flow
import type { ThingConfig } from '../../flowTypes';

import composeDerivativeUploadThingFilesMutation from '../../utils/mergeDerivativeIntoCustom/composeDerivativeUploadThingFilesMutation';
import composeOptionalActionArgs from '../utils/composeOptionalActionArgs';

const composeUploadFilesToThingMutationResolver = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const { args1, args2 } = composeOptionalActionArgs(
    thingConfig,
    composeDerivativeUploadThingFilesMutation,
  );

  const result = [
    `mutation ${prefixName}_upload${name}Files(${args1}) {`,
    `  upload${name}Files(${args2}) {`,
  ];

  return result;
};

export default composeUploadFilesToThingMutationResolver;
