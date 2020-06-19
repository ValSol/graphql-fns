// @flow
import type { GeneralConfig, ThingConfig } from '../flowTypes';

import composeDerivativeConfig from './composeDerivativeConfig';

const composeDerivativeConfigByName = (
  suffix: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): ThingConfig => {
  const { derivative } = generalConfig;

  if (typeof derivative === 'undefined') {
    throw new TypeError('"derivative" property of GeneralConfig must be setted!');
  }

  const result = composeDerivativeConfig(derivative[suffix], thingConfig, generalConfig);

  if (!result) {
    throw new TypeError('Can not compose derivative config!');
  }

  return result;
};

export default composeDerivativeConfigByName;
