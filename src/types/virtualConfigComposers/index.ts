import type {VirtualConfigComposer} from '../../tsTypes';

import composeConnectionVirtualConfig from './composeConnectionVirtualConfig';
import composeConnectionVirtualConfigName from './composeConnectionVirtualConfigName';
import composeEdgeVirtualConfig from './composeEdgeVirtualConfig';
import composeEdgeVirtualConfigName from './composeEdgeVirtualConfigName';

const virtualConfigComposers: Array<[VirtualConfigComposer, (arg1: string) => string, (arg1: string) => boolean]> = [
  [
    composeEdgeVirtualConfig,
    composeEdgeVirtualConfigName,
    (configType: string): boolean => configType !== 'virtual',
  ],
  [
    composeConnectionVirtualConfig,
    composeConnectionVirtualConfigName,
    (configType: string): boolean => configType !== 'virtual',
  ],
];

export default virtualConfigComposers;
