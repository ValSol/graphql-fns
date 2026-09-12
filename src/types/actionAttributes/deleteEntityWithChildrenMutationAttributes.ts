import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import getOppositeFields from '@/utils/getOppositeFields';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createDeleteEntityWithChildrenOptionsInputType from '../inputs/createDeleteEntityWithChildrenOptionsInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string =>
  `deleteEntityWithChildren${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `delete${baseName}WithChildren${representationKey}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createDeleteEntityWithChildrenOptionsInputType,
  createStringInputType,
];

const argNames = ['whereOne', 'options', 'token'];

const argTypes = [
  ({ name }): string => `${name}WhereOneInput!`,
  ({ name }): string => `delete${name}WithChildrenOptionsInput`,
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
  Boolean(
    getOppositeFields(entityConfig).filter(
      ([, { array, parent }]: [any, any]) => !(array || parent),
    ).length,
  );

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `${name}${representationKey}!`;

const deleteEntityWithChildrenMutationAttributes = {
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

export default deleteEntityWithChildrenMutationAttributes;
