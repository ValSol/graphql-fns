import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import getOppositeFields from '../../utils/getOppositeFields';
import createCopyEntityOptionsInputType from '../inputs/createCopyEntityOptionsInputType';
import createEntityCopyWhereOnesInputType from '../inputs/createEntityCopyWhereOnesInputType';
import createEntityWhereOneToCopyInputType from '../inputs/createEntityWhereOneToCopyInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string =>
  `copyEntityWithChildren${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `copy${baseName}WithChildren${representationKey}`;

const inputCreators = [
  createEntityCopyWhereOnesInputType,
  createCopyEntityOptionsInputType,
  createEntityWhereOneToCopyInputType,
  createStringInputType,
];

const argNames = ['whereOnes', 'options', 'whereOne', 'token'];

const argTypes = [
  ({ name }): string => `${name}CopyWhereOnesInput!`,
  ({ name }): string => `copy${name}OptionsInput`,
  ({ name }): string => `${name}WhereOneToCopyInput`,
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
  entityConfig.type === 'tangible' &&
  Boolean(createEntityCopyWhereOnesInputType(entityConfig)[1]) &&
  Boolean(
    getOppositeFields(entityConfig).filter(
      ([, { array, parent }]: [any, any]) => !(array || parent),
    ).length,
  );

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `${name}${representationKey}!`;

const copyEntityWithChildrenMutationAttributes = {
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

export default copyEntityWithChildrenMutationAttributes;
