// @flow
import type { DerivativeSignatureMethods, GeneralConfig, ThingConfig } from '../flowTypes';

const composeDerivativeConfig = (
  signatureMethods: DerivativeSignatureMethods,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): null | ThingConfig => {
  const { name: composeName, config: composeConfig } = signatureMethods;

  const name = composeName(thingConfig, generalConfig);

  // by making name = '' filter unnecessary configs
  if (!name) return null;

  return composeConfig(thingConfig, generalConfig);
};

export default composeDerivativeConfig;
