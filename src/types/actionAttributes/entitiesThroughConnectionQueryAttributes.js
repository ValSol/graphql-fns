// @flow

import pluralize from 'pluralize';

import type {
  DerivativeAttributes,
  EntityConfig,
  GeneralConfig,
  InputCreator,
} from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntitySortInputType from '../inputs/createEntitySortInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

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

  const { allEntityConfigs } = generalConfig;

  const connectionConfigName = `${name}Connection`;

  const connectionConfig = allEntityConfigs[connectionConfigName];

  return suffix
    ? composeDerivativeConfigByName(suffix, connectionConfig, generalConfig)
    : connectionConfig;
};

const actionReturnVirtualConfigs = ['composeEdgeVirtualConfig', 'composeConnectionVirtualConfig'];

const actionDerivativeUpdater = (entityName: string, item: { ...DerivativeAttributes }) => {
  const { suffix } = item;

  const edgeName = `${entityName}Edge`;

  const connectionName = `${entityName}Connection`;

  if (!item.allow[edgeName]) {
    item.allow = { ...item.allow, [edgeName]: [] }; // eslint-disable-line no-param-reassign
  }

  if (!item.allow[connectionName]) {
    item.allow = { ...item.allow, [connectionName]: [] }; // eslint-disable-line no-param-reassign
  }

  if (!item.derivativeFields) {
    item.derivativeFields = {}; // eslint-disable-line no-param-reassign
  }

  if (!item.derivativeFields[edgeName]) {
    item.derivativeFields = { ...item.derivativeFields, [edgeName]: { node: suffix } }; // eslint-disable-line no-param-reassign
  }

  if (!item.derivativeFields[connectionName]) {
    // eslint-disable-next-line no-param-reassign
    item.derivativeFields = {
      ...item.derivativeFields,
      [connectionName]: { edges: suffix },
    };
  }
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
  actionReturnVirtualConfigs,
  actionDerivativeUpdater,
  actionAllowed,
};

export default entitiesThroughConnectionQueryAttributes;
