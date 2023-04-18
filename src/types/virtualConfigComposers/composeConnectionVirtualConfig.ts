import { string } from 'yup/lib/locale';
import virtualConfigComposers from '.';
import type { VirtualConfigComposer, VirtualEntityConfig } from '../../tsTypes';

import composeConnectionVirtualConfigName from './composeConnectionVirtualConfigName';

const composeConnectionVirtualConfig: VirtualConfigComposer = (config, generalConfig) => {
  const { name, type: configType = 'tangible' } = config;

  if (configType === 'virtual') {
    throw new TypeError(
      `Forbidden to use entity config with type: "${configType}" to compose "Connection" virtual config!`,
    );
  }

  const {
    allEntityConfigs: { PageInfo, [`${name}Edge`]: edgeConfig },
  } = generalConfig;

  const result: VirtualEntityConfig = {
    name: composeConnectionVirtualConfigName(name),
    type: 'virtual',
    descendantNameSlicePosition: -'Connection'.length,

    childFields: [
      {
        name: 'pageInfo',
        config: PageInfo as VirtualEntityConfig,
        required: true,
        type: 'childFields',
      },
      {
        name: 'edges',
        config: edgeConfig as VirtualEntityConfig,
        array: true,
        type: 'childFields',
      },
    ],
  };

  return result;
};

export default composeConnectionVirtualConfig;
