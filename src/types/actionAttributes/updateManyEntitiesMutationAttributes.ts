import pluralize from 'pluralize';

import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createEntityUpdateInputType from '../inputs/createEntityUpdateInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string =>
  `updateManyEntities${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `updateMany${pluralize(baseName)}${representationKey}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createEntityUpdateInputType,
  createStringInputType,
];

const argNames = ['whereOne', 'data', 'token'];

const argTypes = [
  ({ name }): string => `[${name}WhereOneInput!]!`,
  ({ name }): string => `[${name}UpdateInput!]!`,
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({
  inputOutputEntity: `${name}${representationKey}`,
});

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

const updateManyEntitiesMutationAttributes = {
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

export default updateManyEntitiesMutationAttributes;
