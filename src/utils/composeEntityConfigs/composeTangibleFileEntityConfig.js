// @flow

import type { SimplifiedEntityConfig } from '../../flowTypes';

const composeTangibleFileEntityConfig = (
  config: SimplifiedEntityConfig,
): SimplifiedEntityConfig => {
  const { name } = config;

  const tangibleConfig: SimplifiedEntityConfig = Object.keys(config).reduce((prev, key) => {
    if (key === 'name') {
      prev[key] = `Tangible${name}`; // eslint-disable-line no-param-reassign
    } else if (key === 'type') {
      prev[key] = 'tangibleFile'; // eslint-disable-line no-param-reassign
    } else if (key.endsWith('Fields')) {
      // $FlowFixMe
      prev[key] = config[key].filter(({ freeze }) => freeze); // eslint-disable-line no-param-reassign
    } else {
      // $FlowFixMe
      prev[key] = config[key]; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

  return tangibleConfig;
};

export default composeTangibleFileEntityConfig;
