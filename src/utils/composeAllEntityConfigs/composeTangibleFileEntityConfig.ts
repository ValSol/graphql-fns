import type { TangibleEntityConfig, TangibleFileEntityConfig } from '../../tsTypes';

import composeTangibleFileConfigName from './composeTangibleFileConfigName';

const composeTangibleFileEntityConfig = (
  config: TangibleEntityConfig,
): TangibleFileEntityConfig => {
  const { name } = config;

  const tangibleConfig = Object.keys(config).reduce((prev, key) => {
    if (key === 'name') {
      prev[key] = composeTangibleFileConfigName(name); // eslint-disable-line no-param-reassign
    } else if (key === 'interfaces') {
      // do nothing
    } else if (key === 'type') {
      prev[key] = 'tangibleFile'; // eslint-disable-line no-param-reassign
    } else if (key.endsWith('Fields')) {
      prev[key] = config[key].filter(({ freeze }) => freeze); // eslint-disable-line no-param-reassign
    } else {
      prev[key] = config[key]; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {} as TangibleFileEntityConfig);

  return tangibleConfig;
};

export default composeTangibleFileEntityConfig;
