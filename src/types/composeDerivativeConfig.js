// @flow
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../flowTypes';

const composeDerivativeConfig = (
  signatureMethods: DerivativeAttributes,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): null | ThingConfig => {
  const { name } = thingConfig;

  const { suffix, config: composeConfig, allowedRootNames } = signatureMethods;

  if (!allowedRootNames.includes(name)) return null;

  return { ...composeConfig(thingConfig, generalConfig), name: `${name}${suffix}` };
};

export default composeDerivativeConfig;
