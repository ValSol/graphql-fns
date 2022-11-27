// @flow

import type { EntityConfig } from '../../flowTypes';

const removeBlobUrls = (
  values: Object,
  getBlobUrlFromValue: (any) => string,
  entityConfig: EntityConfig,
): void => {
  const { fileFields } = entityConfig;

  if (!fileFields) return;

  fileFields.forEach(({ array, name }) => {
    if (array) {
      values[name].forEach((val) => window.URL.revokeObjectURL(getBlobUrlFromValue(val)));
    } else {
      window.URL.revokeObjectURL(getBlobUrlFromValue(values[name]));
    }
  });
};
export default removeBlobUrls;
