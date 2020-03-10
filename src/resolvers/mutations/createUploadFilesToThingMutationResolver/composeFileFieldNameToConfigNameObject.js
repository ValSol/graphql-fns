// @flow
import type { ThingConfig } from '../../../flowTypes';

const composeFileFieldNameToConfigNameObject = (
  thingConfig: ThingConfig,
): { [fileFieldName: string]: string } => {
  const { fileFields } = thingConfig;

  if (!fileFields) return {};

  return fileFields.reduce((prev, { name, config: { name: configName } }) => {
    // eslint-disable-next-line no-param-reassign
    prev[name] = configName;
    return prev;
  }, {});
};

export default composeFileFieldNameToConfigNameObject;
