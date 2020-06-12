// @flow
import type { GeneralConfig, ThingConfig } from '../flowTypes';

const composeDerivativeConfigByName = (
  derivativeConfigName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): ThingConfig => {
  const { name } = thingConfig;
  const { derivative } = generalConfig;

  if (typeof derivative === 'undefined') {
    throw new TypeError('"derivative" property of GeneralConfig must be setted!');
  }

  const {
    [derivativeConfigName]: { config: composeConfig, suffix },
  } = derivative;
  return { ...composeConfig(thingConfig, generalConfig), name: `${name}${suffix}` };
};

export default composeDerivativeConfigByName;
