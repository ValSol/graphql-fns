// @flow

import type { EntityConfig } from '../../flowTypes';

import getOppositeFields from '../../utils/getOppositeFields';
import createCopyEntityOptionsInputType from '../inputs/createCopyEntityOptionsInputType';
import createEntityCopyWhereOnesInputType from '../inputs/createEntityCopyWhereOnesInputType';
import createEntityWhereOneToCopyInputType from '../inputs/createEntityWhereOneToCopyInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `copyEntityWithChildren${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `copy${baseName}WithChildren${suffix}`;

const inputCreators = [
  createEntityCopyWhereOnesInputType,
  createCopyEntityOptionsInputType,
  createEntityWhereOneToCopyInputType,
];

const argNames = ['whereOnes', 'options', 'whereOne'];

const argTypes = [
  (name: string): string => `${name}CopyWhereOnesInput!`,
  (name: string): string => `copy${name}OptionsInput`,
  (name: string): string => `${name}WhereOneToCopyInput`,
];

const actionReturnConfig = true;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' &&
  Boolean(createEntityCopyWhereOnesInputType(entityConfig)[1]) &&
  Boolean(
    getOppositeFields(entityConfig).filter(([, { array, parent }]) => !(array || parent)).length,
  );

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `${name}${suffix}!`;

const copyEntityWithChildrenMutationAttributes = {
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

export default copyEntityWithChildrenMutationAttributes;
