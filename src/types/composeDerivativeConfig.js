// @flow
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../flowTypes';

const composeDerivativeConfig = (
  signatureMethods: DerivativeAttributes,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): null | ThingConfig => {
  const { name } = thingConfig;

  const { suffix, config: composeConfig, allow } = signatureMethods;

  // 'allow[key] && ...' to prevent flowjs error
  const allowed = Object.keys(allow).some((key) => allow[key] && allow[key].includes(name));

  if (!allowed) return null;

  return { ...composeConfig(thingConfig, generalConfig), name: `${name}${suffix}` };
};

export default composeDerivativeConfig;
