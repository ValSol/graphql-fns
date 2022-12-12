// @flow
import type { GeneralConfig } from '../../../flowTypes';

const parseEntityName = (
  entityConfigName: string,
  generalConfig: GeneralConfig,
): { root: string, suffix: string } => {
  const { allEntityConfigs, derivative } = generalConfig;
  if (allEntityConfigs[entityConfigName]) return { root: entityConfigName, suffix: '' };

  if (!derivative) throw new TypeError('"derivative" attribute of generalConfig must be setted!');

  const suffix = Object.keys(derivative).find(
    (key) =>
      key === entityConfigName.slice(-key.length) &&
      allEntityConfigs[entityConfigName.slice(0, -key.length)],
  );

  if (!suffix) {
    throw new TypeError(`Not found suffix for "${entityConfigName}" derivative config name!`);
  }

  const nameRoot = entityConfigName.slice(0, -suffix.length);

  return { suffix, root: nameRoot };
};

export default parseEntityName;
