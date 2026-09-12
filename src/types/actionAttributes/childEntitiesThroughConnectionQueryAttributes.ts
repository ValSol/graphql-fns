import pluralize from 'pluralize';

import type {
  ActionInvolvedEntityNames,
  EntityConfig,
  GeneralConfig,
  InputCreator,
} from '@/tsTypes';

import composeRepresentationConfig from '@/utils/composeRepresentationConfig';
import connectionRepresentationUpdater from '../actionRepresentationUpdaters/connectionRepresentationUpdater';
import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntitySortInputType from '../inputs/createEntitySortInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

const actionType = 'Query';

const actionGeneralName = (representationKey = ''): string =>
  `childEntitiesThroughConnection${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `child${pluralize(baseName)}ThroughConnection${representationKey}`;

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
  ({ name }): string => `${name}WhereInput`,
  ({ name }): string => `${name}SortInput`,
  ({ name }): string => `${name}NearInput`,
  (): string => 'String',
  (): string => 'String',
  (): string => 'String',
  (): string => 'Int',
  (): string => 'Int',
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

  const { allEntityConfigs, representation } = generalConfig;

  const connectionConfigName = `${name}Connection`;

  const connectionConfig = allEntityConfigs[connectionConfigName];

  if (representationKey) {
    try {
      return representation
        ? composeRepresentationConfig(
            representation[representationKey],
            connectionConfig,
            generalConfig,
          )
        : null;
    } catch (err) {
      throw new TypeError(err);
    }
  }

  return connectionConfig;
};

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionIsChild = 'Array';

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `${name}${representationKey}Connection!`;

const childEntitiesThroughConnectionQueryAttributes = {
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
  actionIsChild,
} as const;

export default childEntitiesThroughConnectionQueryAttributes;
