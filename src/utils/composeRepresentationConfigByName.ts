import type { GeneralConfig, EntityConfig } from '../tsTypes';

import composeRepresentationConfig from './composeRepresentationConfig';

const composeRepresentationConfigByName = (
  representationKey: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): EntityConfig => {
  const { representations } = generalConfig;

  if (typeof representations === 'undefined') {
    throw new TypeError('"representations" property of GeneralConfig must be setted!');
  }

  const result = composeRepresentationConfig(
    representations[representationKey],
    entityConfig,
    generalConfig,
  );

  if (!result) {
    throw new TypeError('Can not compose representation config!');
  }

  return result;
};

export default composeRepresentationConfigByName;
