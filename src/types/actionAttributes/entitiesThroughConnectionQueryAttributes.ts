import pluralize from 'pluralize';

import type {
  ActionInvolvedEntityNames,
  EntityConfig,
  GeneralConfig,
  InputCreator,
} from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import connectionRepresentationUpdater from '../actionRepresentationUpdaters/connectionRepresentationUpdater';
import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntitySortInputType from '../inputs/createEntitySortInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Query';

const actionGeneralName = (representationKey = ''): string =>
  `entitiesThroughConnection${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `${pluralize(baseName)}ThroughConnection${representationKey}`;

const inputCreators = [
  createEntityWhereInputType,
  createEntitySortInputType,
  createEntityNearInputType,
  createStringInputTypeForSearch,
  createStringInputType,
  createStringInputType,
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
  createStringInputType,
];

const argNames = ['where', 'sort', 'near', 'search', 'after', 'before', 'first', 'last', 'token'];

const argTypes = [
  ({ name }): string => `${name}WhereInput`,
  ({ name }): string => `${name}SortInput`,
  ({ name }): string => `${name}NearInput`,
  (): string => 'String',
  (): string => 'String',
  (): string => 'String',
  (): string => 'Int',
  (): string => 'Int',
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({ inputOutputEntity: `${name}${representationKey}` });

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  representationKey?: string,
): null | EntityConfig => {
  const { name } = entityConfig;

  const { allEntityConfigs } = generalConfig;

  const connectionConfigName = `${name}Connection`;

  const connectionConfig = allEntityConfigs[connectionConfigName];

  return representationKey
    ? composeRepresentationConfigByName(representationKey, connectionConfig, generalConfig)
    : connectionConfig;
};

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `${name}${representationKey}Connection!`;

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
  actionRepresentationUpdater: connectionRepresentationUpdater,
  actionAllowed,
} as const;

export default entitiesThroughConnectionQueryAttributes;
