import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string => `deleteEntity${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `delete${baseName}${representationKey}`;

const inputCreators = [createEntityWhereOneInputType, createStringInputType];

const argNames = ['whereOne', 'token'];

const argTypes = [({ name }): string => `${name}WhereOneInput!`, (): string => 'String'];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({
  inputOutputEntity: `${name}${representationKey}`,
  subscriptionDeletedEntity: name, // provide for "name" & all its representations
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

const deleteEntityMutationAttributes = {
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

export default deleteEntityMutationAttributes;
