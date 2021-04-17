// @flow
import type { GeneralConfig } from '../../../flowTypes';

const parseThingName = (
  thingConfigName: string,
  generalConfig: GeneralConfig,
): { root: string, suffix: string } => {
  const { thingConfigs, derivative } = generalConfig;
  if (thingConfigs[thingConfigName]) return { root: thingConfigName, suffix: '' };

  if (!derivative) throw new TypeError('"derivative" attribute of generalConfig must be setted!');

  const suffix = Object.keys(derivative).find(
    (key) =>
      key === thingConfigName.slice(-key.length) &&
      thingConfigs[thingConfigName.slice(0, -key.length)],
  );

  if (!suffix) {
    throw new TypeError(`Not found suffix for "${thingConfigName}" derivative config name!`);
  }

  const nameRoot = thingConfigName.slice(0, -suffix.length);

  return { suffix, root: nameRoot };
};

export default parseThingName;
