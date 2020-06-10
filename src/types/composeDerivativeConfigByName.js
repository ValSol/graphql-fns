// @flow
import type { GeneralConfig, ThingConfig } from '../flowTypes';

const composeDerivativeConfigByName = (
  derivativeConfigName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): ThingConfig => {
  const { derivative } = generalConfig;

  if (typeof derivative === 'undefined') {
    throw new TypeError('"derivative" property of GeneralConfig must be setted!');
  }

  const {
    [derivativeConfigName]: { config: composeConfig },
  } = derivative;
  return composeConfig(thingConfig, generalConfig);
};

export default composeDerivativeConfigByName;
