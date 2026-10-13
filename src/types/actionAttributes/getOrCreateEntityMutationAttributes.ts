import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import createEntityCreateInputType from '../inputs/createEntityCreateInputType';
import createEntityWhereCompoundOneInputType from '../inputs/createEntityWhereCompoundOneInputType';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string =>
  `getOrCreateEntity${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `getOrCreate${baseName}${representationKey}`;

// "whereOne" & "whereCompoundOne" as in "entity" query, "data" as in "createEntity" mutation
const inputCreators = [
  createEntityWhereOneInputType,
  createEntityWhereCompoundOneInputType,
  createEntityCreateInputType,
  createStringInputType,
];

const argNames = ['whereOne', 'whereCompoundOne', 'data', 'token'];

const argTypes = [
  ({ name, uniqueCompoundIndexes }): string =>
    `${name}WhereOneInput${uniqueCompoundIndexes ? '' : '!'}`,
  ({ name }): string => `${name}WhereCompoundOneInput`,
  ({ name }): string => `${name}CreateInput!`,
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({
  inputOutputEntity: `${name}${representationKey}`,
  subscriptionCreatedEntity: name, // provide for "name" & all its representations
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

const getOrCreateEntityMutationAttributes = {
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

export default getOrCreateEntityMutationAttributes;
