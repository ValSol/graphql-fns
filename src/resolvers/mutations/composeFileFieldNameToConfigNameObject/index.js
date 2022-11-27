// @flow
import type { EntityConfig } from '../../../flowTypes';

const composeFileFieldNameToConfigNameObject = (
  entityConfig: EntityConfig,
): { [fileFieldName: string]: { configName: string, array?: boolean } } => {
  const { fileFields } = entityConfig;

  if (!fileFields) return {};

  return fileFields.reduce((prev, { name, array, config: { name: configName } }) => {
    // eslint-disable-next-line no-param-reassign, react/forbid-prop-types
    prev[name] = { configName, array };
    return prev;
  }, {});
};

export default composeFileFieldNameToConfigNameObject;
