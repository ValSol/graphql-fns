// @flow

import type { GeneralConfig } from '../../flowTypes';

const createFileWhereOneInputType = (generalConfig: GeneralConfig): string => {
  const { thingConfigs } = generalConfig;

  const thereAreFiles = Object.keys(thingConfigs).some(
    (key) => thingConfigs[key] && thingConfigs[key].file,
  );

  if (!thereAreFiles) return '';

  return `input FileWhereOneInput {
  id: ID
  hash: String
}`;
};

export default createFileWhereOneInputType;
