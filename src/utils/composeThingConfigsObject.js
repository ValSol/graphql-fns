// @flow
import type { GeneralConfig, ThingConfig } from '../flowTypes';

type ThingConfigsObject = { [key: string]: ThingConfig };
const composeThingConfigsObject = (generalConfig: GeneralConfig): ThingConfigsObject => {
  const { thingConfigs } = generalConfig;

  return thingConfigs.reduce((prev, thingConfig) => {
    const { name } = thingConfig;
    prev[name] = thingConfig; // eslint-disable-line no-param-reassign
    return prev;
  }, {});
};

export default composeThingConfigsObject;
