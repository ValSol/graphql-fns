import type { GeneralConfig, EntityConfig } from '../tsTypes';

import composeRepresentationConfig from './composeRepresentationConfig';

const composeRepresentationConfigByName = (
  representationKey: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): EntityConfig => {
  const { representation } = generalConfig;

  if (typeof representation === 'undefined') {
    throw new TypeError('"representation" property of GeneralConfig must be setted!');
  }

  const result = composeRepresentationConfig(
    representation[representationKey],
    entityConfig,
    generalConfig,
  );

  if (!result) {
    throw new TypeError('Can not compose representation config!');
  }

  return result;
};

export default composeRepresentationConfigByName;
