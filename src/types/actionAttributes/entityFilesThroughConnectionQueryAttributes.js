// @flow

import type { EntityConfig, GeneralConfig, InputCreator } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createFileWhereInputType from '../inputs/createFileWhereInputType';
import connectionDerivativeUpdater from '../actionDerivativeUpdaters/connectionDerivativeUpdater';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `entityFilesThroughConnection${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `${baseName}FilesThroughConnection${suffix}`;

const inputCreators = [
  createFileWhereInputType,
  (): [string, string, { [inputSpecificName: string]: [InputCreator, EntityConfig] }] => [
    '',
    'String',
    {},
  ],
  (): [string, string, { [inputSpecificName: string]: [InputCreator, EntityConfig] }] => [
    '',
    'String',
    {},
  ],
  (): [string, string, { [inputSpecificName: string]: [InputCreator, EntityConfig] }] => [
    '',
    'Int',
    {},
  ],
  (): [string, string, { [inputSpecificName: string]: [InputCreator, EntityConfig] }] => [
    '',
    'Int',
    {},
  ],
];

const argNames = ['where', 'after', 'before', 'first', 'last'];

const argTypes = [
  (name: string): string => 'FileWhereInput', // eslint-disable-line no-unused-vars
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
  (name: string): string => 'Int', // eslint-disable-line no-unused-vars
  (name: string): string => 'Int', // eslint-disable-line no-unused-vars
];

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  suffix?: string,
): null | EntityConfig => {
  const { name } = entityConfig;

  const { allEntityConfigs } = generalConfig;

  const connectionConfigName = `${name}Connection`;

  const connectionConfig = allEntityConfigs[connectionConfigName];

  return suffix
    ? composeDerivativeConfigByName(suffix, connectionConfig, generalConfig)
    : connectionConfig;
};

const actionReturnVirtualConfigs = ['composeEdgeVirtualConfig', 'composeConnectionVirtualConfig'];

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangibleFile';

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `${name}Connection${suffix}`;

const entityFilesThroughConnectionQueryAttributes = {
  actionGeneralName,
  actionType,
  actionName,
  inputCreators,
  argNames,
  argTypes,
  actionReturnString,
  actionReturnConfig,
  actionReturnVirtualConfigs,
  actionDerivativeUpdater: connectionDerivativeUpdater,
  actionAllowed,
};

export default entityFilesThroughConnectionQueryAttributes;
