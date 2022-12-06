// @flow

import pluralize from 'pluralize';

import type { InputCreator, EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntitySortInputType from '../inputs/createEntitySortInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import composeConnectionVirtualConfig from '../virtualConfigComposers/composeConnectionVirtualConfig';
import composeEdgeVirtualConfig from '../virtualConfigComposers/composeEdgeVirtualConfig';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `entitiesThroughConnection${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `${pluralize(baseName)}ThroughConnection${suffix}`;

const inputCreators = [
  createEntityWhereInputType,
  createEntitySortInputType,
  createEntityNearInputType,
  createStringInputTypeForSearch,
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

const argNames = ['where', 'sort', 'near', 'search', 'after', 'before', 'first', 'last'];

const argTypes = [
  (name: string): string => `${name}WhereInput`,
  (name: string): string => `${name}SortInput`,
  (name: string): string => `${name}NearInput`,
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
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

  const { entityConfigs } = generalConfig;

  const connectionConfigName = `${name}Connection`;

  const connectionConfig = entityConfigs[connectionConfigName];

  return suffix
    ? composeDerivativeConfigByName(suffix, connectionConfig, generalConfig)
    : connectionConfig;
};

const actionReturnVirtualConfigs = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  suffix?: string, // eslint-disable-line no-unused-vars
): Array<EntityConfig> => {
  const result = [];

  result.push(composeEdgeVirtualConfig(entityConfig, generalConfig));
  result.push(composeConnectionVirtualConfig(entityConfig, generalConfig));

  return result;
};

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `${name}${suffix}Connection`;

const entitiesThroughConnectionQueryAttributes = {
  actionGeneralName,
  actionType,
  actionName,
  inputCreators,
  argNames,
  argTypes,
  actionReturnString,
  actionReturnConfig,
  actionAllowed,
};

export default entitiesThroughConnectionQueryAttributes;
