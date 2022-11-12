// @flow

import type { SimplifiedThingConfig } from '../../flowTypes';

const composeRootFileThingConfig = (
  config: SimplifiedThingConfig,
): [string, SimplifiedThingConfig] => {
  const { name } = config;

  const rootName = `Root${name}`;

  const rootConfig: SimplifiedThingConfig = Object.keys(config).reduce((prev, key) => {
    if (key === 'name') {
      prev[key] = `Root${name}`; // eslint-disable-line no-param-reassign
    } else if (key.endsWith('Fields')) {
      // $FlowFixMe
      prev[key] = config[key].filter(({ freeze }) => freeze); // eslint-disable-line no-param-reassign
    } else {
      // $FlowFixMe
      prev[key] = config[key]; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

  return [rootName, rootConfig];
};

export default composeRootFileThingConfig;
