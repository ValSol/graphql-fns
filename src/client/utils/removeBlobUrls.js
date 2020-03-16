// @flow

import type { ThingConfig } from '../../flowTypes';

const removeBlobUrls = (
  values: Object,
  getBlobUrlFromValue: any => string,
  thingConfig: ThingConfig,
): void => {
  const { fileFields } = thingConfig;

  if (!fileFields) return;

  fileFields.forEach(({ array, name }) => {
    if (array) {
      values[name].forEach(val => window.URL.revokeObjectURL(getBlobUrlFromValue(val)));
    } else {
      window.URL.revokeObjectURL(getBlobUrlFromValue(values[name]));
    }
  });
};
export default removeBlobUrls;
