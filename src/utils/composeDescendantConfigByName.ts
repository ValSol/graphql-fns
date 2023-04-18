import type { GeneralConfig, EntityConfig } from '../tsTypes';

import composeDescendantConfig from './composeDescendantConfig';

const composeDescendantConfigByName = (
  descendantKey: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): EntityConfig => {
  const { descendant } = generalConfig;

  if (typeof descendant === 'undefined') {
    throw new TypeError('"descendant" property of GeneralConfig must be setted!');
  }

  const result = composeDescendantConfig(descendant[descendantKey], entityConfig, generalConfig);

  if (!result) {
    throw new TypeError('Can not compose descendant config!');
  }

  return result;
};

export default composeDescendantConfigByName;
