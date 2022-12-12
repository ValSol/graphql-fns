// @flow

import type { EntityConfig } from '../../flowTypes';

import composeTangibleFileConfigName from './composeTangibleFileConfigName';

const composeTangibleFileEntityConfig = (config: EntityConfig): EntityConfig => {
  const { name } = config;

  const tangibleConfig: EntityConfig = Object.keys(config).reduce((prev, key) => {
    if (key === 'name') {
      prev[key] = composeTangibleFileConfigName(name); // eslint-disable-line no-param-reassign
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
