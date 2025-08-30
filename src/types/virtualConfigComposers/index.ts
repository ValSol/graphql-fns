import type { EntityConfig, Enums, Inventory, VirtualConfigComposer } from '@/tsTypes';

import composeConnectionVirtualConfig from './composeConnectionVirtualConfig';
import composeConnectionVirtualConfigName from './composeConnectionVirtualConfigName';
import composeEdgeVirtualConfig from './composeEdgeVirtualConfig';
import composeEdgeVirtualConfigName from './composeEdgeVirtualConfigName';
import composeUpdatedPayloadVirtualConfig from './composeUpdatedPayloadVirtualConfig';
import composeUpdatedPayloadVirtualConfigName from './composeUpdatedPayloadVirtualConfigName';

export type VirtualConfigComposerItem = [
  VirtualConfigComposer,
  (arg1: string) => string,
  (arg1: string) => boolean,
];

const virtualConfigComposers: VirtualConfigComposerItem[] = [
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

  [
    composeUpdatedPayloadVirtualConfig,
    composeUpdatedPayloadVirtualConfigName,
    (configType: string): boolean => configType === 'tangible',
  ],
];

export default virtualConfigComposers;
