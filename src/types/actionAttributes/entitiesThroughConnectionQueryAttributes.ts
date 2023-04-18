import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig, InputCreator } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import connectionDescendantUpdater from '../actionDescendantUpdaters/connectionDescendantUpdater';
import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntitySortInputType from '../inputs/createEntitySortInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

const actionType = 'Query';

const actionGeneralName = (descendantKey: string = ''): string =>
  `entitiesThroughConnection${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `${pluralize(baseName)}ThroughConnection${descendantKey}`;

const inputCreators = [
  createEntityWhereInputType,
  createEntitySortInputType,
  createEntityNearInputType,
  createStringInputTypeForSearch,
  (): [
    string,
    string,
    {
      [inputSpecificName: string]: [InputCreator, EntityConfig];
    },
  ] => ['', 'String', {}],
  (): [
    string,
    string,
    {
      [inputSpecificName: string]: [InputCreator, EntityConfig];
    },
  ] => ['', 'String', {}],
  (): [
    string,
    string,
    {
      [inputSpecificName: string]: [InputCreator, EntityConfig];
    },
  ] => ['', 'Int', {}],
  (): [
    string,
    string,
    {
      [inputSpecificName: string]: [InputCreator, EntityConfig];
    },
  ] => ['', 'Int', {}],
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

const actionInvolvedEntityNames = (
  name: string,
  descendantKey: string = '',
): {
  [key: string]: string;
} => ({ inputOutputEntity: `${name}${descendantKey}` });

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  descendantKey?: string,
): null | EntityConfig => {
  const { name } = entityConfig;

  const { allEntityConfigs } = generalConfig;

  const connectionConfigName = `${name}Connection`;

  const connectionConfig = allEntityConfigs[connectionConfigName];

  return descendantKey
    ? composeDescendantConfigByName(descendantKey, connectionConfig, generalConfig)
    : connectionConfig;
};

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, descendantKey: string = ''): string =>
  `${name}${descendantKey}Connection`;

const entitiesThroughConnectionQueryAttributes = {
  actionGeneralName,
  actionType,
  actionName,
  inputCreators,
  argNames,
  argTypes,
  actionInvolvedEntityNames,
  actionReturnString,
  actionReturnConfig,
  actionDescendantUpdater: connectionDescendantUpdater,
  actionAllowed,
} as const;

export default entitiesThroughConnectionQueryAttributes;
