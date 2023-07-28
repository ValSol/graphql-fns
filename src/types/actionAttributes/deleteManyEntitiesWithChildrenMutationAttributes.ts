import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import getOppositeFields from '../../utils/getOppositeFields';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createDeleteEntityWithChildrenOptionsInputType from '../inputs/createDeleteEntityWithChildrenOptionsInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (descendantKey = ''): string =>
  `deleteManyEntitiesWithChildren${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `deleteMany${pluralize(baseName)}WithChildren${descendantKey}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createDeleteEntityWithChildrenOptionsInputType,
  createStringInputType,
];

const argNames = ['whereOne', 'options', 'token'];

const argTypes = [
  ({ name }): string => `[${name}WhereOneInput!]!`,
  ({ name }): string => `delete${name}WithChildrenOptionsInput`,
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey = '',
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

const actionReturnString = ({ name }: EntityConfig, descendantKey = ''): string =>
  `[${name}${descendantKey}!]!`;

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
