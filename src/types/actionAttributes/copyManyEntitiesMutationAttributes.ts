import pluralize from 'pluralize';

import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import createCopyEntityOptionsInputType from '../inputs/createCopyEntityOptionsInputType';
import createEntityCopyWhereOnesInputType from '../inputs/createEntityCopyWhereOnesInputType';
import createEntityUpdateInputType from '../inputs/createEntityUpdateInputType';
import createEntityWhereOneToCopyInputType from '../inputs/createEntityWhereOneToCopyInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string =>
  `copyManyEntities${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `copyMany${pluralize(baseName)}${representationKey}`;

const inputCreators = [
  createEntityCopyWhereOnesInputType,
  createCopyEntityOptionsInputType,
  createEntityWhereOneToCopyInputType,
  createEntityUpdateInputType,
  createStringInputType,
];

const argNames = ['whereOnes', 'options', 'whereOne', 'data', 'token'];

const argTypes = [
  ({ name }): string => `[${name}CopyWhereOnesInput!]!`,
  ({ name }): string => `copy${name}OptionsInput`,
  ({ name }): string => `[${name}WhereOneToCopyInput!]`,
  ({ name }): string => `[${name}UpdateInput!]`,
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

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' && Boolean(createEntityCopyWhereOnesInputType(entityConfig)[1]);

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `[${name}${representationKey}!]!`;

const copyManyEntitiesMutationAttributes = {
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

export default copyManyEntitiesMutationAttributes;
