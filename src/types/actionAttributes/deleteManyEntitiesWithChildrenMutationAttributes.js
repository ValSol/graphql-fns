// @flow

import pluralize from 'pluralize';

import type { EntityConfig } from '../../flowTypes';

import getOppositeFields from '../../utils/getOppositeFields';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createDeleteEntityWithChildrenOptionsInputType from '../inputs/createDeleteEntityWithChildrenOptionsInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string =>
  `deleteManyEntitiesWithChildren${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `deleteMany${pluralize(baseName)}WithChildren${suffix}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createDeleteEntityWithChildrenOptionsInputType,
];

const argNames = ['whereOne', 'options'];

const argTypes = [
  (name: string): string => `[${name}WhereOneInput!]!`,
  (name: string): string => `delete${name}WithChildrenOptionsInput`,
];

const actionReturnConfig = true;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' &&
  Boolean(
    getOppositeFields(entityConfig).filter(([, { array, parent }]) => !(array || parent)).length,
  );

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `[${name}${suffix}!]!`;

const deleteManyEntitiesWithChildrenMutationAttributes = {
  actionGeneralName,
  actionType,
  actionName,
  inputCreators,
  argNames,
  argTypes,
  actionReturnString,
  actionReturnConfig,
  actionAllowed,
};

export default deleteManyEntitiesWithChildrenMutationAttributes;
