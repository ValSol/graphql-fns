import type {GeneralConfig, EntityConfig} from '../tsTypes';

import composeDerivativeConfig from './composeDerivativeConfig';

const composeDerivativeConfigByName = (
  derivativeKey: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): EntityConfig => {
  const { derivative } = generalConfig;

  if (typeof derivative === 'undefined') {
    throw new TypeError('"derivative" property of GeneralConfig must be setted!');
  }

  const result = composeDerivativeConfig(derivative[derivativeKey], entityConfig, generalConfig);

  if (!result) {
    throw new TypeError('Can not compose derivative config!');
  }

  return result;
};

export default composeDerivativeConfigByName;
