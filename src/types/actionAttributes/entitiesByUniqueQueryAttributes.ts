import pluralize from 'pluralize';

import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import createEntityWhereByUniqueInputType from '../inputs/createEntityWhereByUniqueInputType';
import createEntitySortInputType from '../inputs/createEntitySortInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Query';

const actionGeneralName = (representationKey = ''): string =>
  `entitiesByUnique${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `${pluralize(baseName)}ByUnique${representationKey}`;

const inputCreators = [
  createEntityWhereByUniqueInputType,
  createEntitySortInputType,
  createEntityNearInputType,
  createStringInputTypeForSearch,
  createStringInputType,
];

const argNames = ['where', 'sort', 'near', 'search', 'token'];

const argTypes = [
  ({ name }): string => `${name}WhereByUniqueInput!`,
  ({ name }): string => `${name}SortInput`,
  ({ name }): string => `${name}NearInput`,
  (): string => 'String',
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
): null | EntityConfig =>
  representationKey
    ? composeRepresentationConfigByName(representationKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `[${name}${representationKey}!]!`;

const entitiesByUniqueQueryAttributes = {
  actionGeneralName,
  actionType,
  actionName,
  inputCreators,
  argNames,
  argTypes,
  actionInvolvedEntityNames,
  actionReturnString,
  actionReturnConfig,
  actionAllowed,
} as const;

export default entitiesByUniqueQueryAttributes;
