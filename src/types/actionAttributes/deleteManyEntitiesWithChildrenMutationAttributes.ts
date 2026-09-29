import pluralize from 'pluralize';

import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import getChildDuplexFields from '@/utils/getChildDuplexFields';
import createEntityWhereCompoundOneInputType from '../inputs/createEntityWhereCompoundOneInputType';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createDeleteEntityWithChildrenOptionsInputType from '../inputs/createDeleteEntityWithChildrenOptionsInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string =>
  `deleteManyEntitiesWithChildren${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `deleteMany${pluralize(baseName)}WithChildren${representationKey}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createEntityWhereCompoundOneInputType,
  createDeleteEntityWithChildrenOptionsInputType,
  createStringInputType,
];

const argNames = ['whereOne', 'whereCompoundOne', 'options', 'token'];

const argTypes = [
  ({ name, uniqueCompoundIndexes }): string =>
    `[${name}WhereOneInput!]${uniqueCompoundIndexes ? '' : '!'}`,
  ({ name }): string => `[${name}WhereCompoundOneInput!]`,
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
  entityConfig.type === 'tangible' && Boolean(getChildDuplexFields(entityConfig).length);

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `[${name}${representationKey}!]!`;

const deleteManyEntitiesWithChildrenMutationAttributes = {
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

export default deleteManyEntitiesWithChildrenMutationAttributes;
