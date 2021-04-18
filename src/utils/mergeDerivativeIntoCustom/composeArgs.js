// @flow
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const composeArgs = (
  nameGenerators: Array<(name: string) => string>,
  predicates: Array<(thingConfig: ThingConfig) => string | boolean>,
  suffix: string,
): ((thingConfig: ThingConfig, generalConfig: GeneralConfig) => Array<string>) => (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Array<string> => {
  const { name } = thingConfig;
  const derivativeConfig = composeDerivativeConfigByName(suffix, thingConfig, generalConfig);
  return nameGenerators
    .map((nameGenerator) => nameGenerator(name))
    .filter((foo, i) => predicates[i](derivativeConfig));
};

export default composeArgs;
