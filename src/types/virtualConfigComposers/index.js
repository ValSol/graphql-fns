// @flow

import composeConnectionVirtualConfig from './composeConnectionVirtualConfig';
import composeConnectionVirtualConfigName from './composeConnectionVirtualConfigName';
import composeEdgeVirtualConfig from './composeEdgeVirtualConfig';
import composeEdgeVirtualConfigName from './composeEdgeVirtualConfigName';

const virtualConfigComposers = {
  composeConnectionVirtualConfig: [
    composeConnectionVirtualConfig,
    composeConnectionVirtualConfigName,
  ],
  composeEdgeVirtualConfig: [composeEdgeVirtualConfig, composeEdgeVirtualConfigName],
};

export default virtualConfigComposers;
