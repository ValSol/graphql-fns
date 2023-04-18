import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import getOppositeFields from '../../utils/getOppositeFields';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createDeleteEntityWithChildrenOptionsInputType from '../inputs/createDeleteEntityWithChildrenOptionsInputType';

const actionType = 'Mutation';

const actionGeneralName = (descendantKey: string = ''): string =>
  `deleteEntityWithChildren${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `delete${baseName}WithChildren${descendantKey}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createDeleteEntityWithChildrenOptionsInputType,
];

const argNames = ['whereOne', 'options'];

const argTypes = [
  (name: string): string => `${name}WhereOneInput!`,
  (name: string): string => `delete${name}WithChildrenOptionsInput`,
];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey: string = '',
): {
  [key: string]: string;
} => ({
  inputOutputEntity: `${name}${descendantKey}`,
});

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  descendantKey?: string,
): null | EntityConfig =>
  descendantKey
    ? composeDescendantConfigByName(descendantKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' &&
  Boolean(
    getOppositeFields(entityConfig).filter(
      ([, { array, parent }]: [any, any]) => !(array || parent),
    ).length,
  );

const actionReturnString = ({ name }: EntityConfig, descendantKey: string = ''): string =>
  `${name}${descendantKey}!`;

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
