import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import getChildDuplexFields from '@/utils/getChildDuplexFields';
import createCopyEntityOptionsInputType from '../inputs/createCopyEntityOptionsInputType';
import createEntityWhereSourceInputType from '../inputs/createEntityWhereSourceInputType';
import createEntityWhereKeyToTargetInputType from '../inputs/createEntityWhereKeyToTargetInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string =>
  `copyEntityWithChildren${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `copy${baseName}WithChildren${representationKey}`;

const inputCreators = [
  createEntityWhereSourceInputType,
  createCopyEntityOptionsInputType,
  createEntityWhereKeyToTargetInputType,
  createStringInputType,
];

const argNames = ['whereSource', 'options', 'whereKeyToTarget', 'token'];

const argTypes = [
  ({ name }): string => `${name}WhereSourceInput!`,
  ({ name }): string => `copy${name}OptionsInput`,
  ({ name }): string => `${name}WhereKeyToTargetInput`,
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
  Boolean(createEntityWhereSourceInputType(entityConfig)[1]) &&
  Boolean(getChildDuplexFields(entityConfig).length);

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
