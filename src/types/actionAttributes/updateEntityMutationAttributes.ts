import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import createEntityWhereCompoundOneInputType from '../inputs/createEntityWhereCompoundOneInputType';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createEntityUpdateInputType from '../inputs/createEntityUpdateInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string => `updateEntity${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `update${baseName}${representationKey}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createEntityWhereCompoundOneInputType,
  createEntityUpdateInputType,
  createStringInputType,
];

const argNames = ['whereOne', 'whereCompoundOne', 'data', 'token'];

const argTypes = [
  ({ name, uniqueCompoundIndexes }): string =>
    `${name}WhereOneInput${uniqueCompoundIndexes ? '' : '!'}`,
  ({ name }): string => `${name}WhereCompoundOneInput`,
  ({ name }): string => `${name}UpdateInput!`,
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({
  inputOutputEntity: `${name}${representationKey}`,
  subscriptionUpdatedEntity: name, // provide for "name" & all its representations
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
  `${name}${representationKey}!`;

const updateEntityMutationAttributes = {
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

export default updateEntityMutationAttributes;
