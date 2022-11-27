// @flow

import type { EntityConfig } from '../../flowTypes';

import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `deleteEntity${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string => `delete${baseName}${suffix}`;

const inputCreators = [createEntityWhereOneInputType];

const argNames = ['whereOne'];

const argTypes = [(name: string): string => `${name}WhereOneInput!`];

const actionReturnConfig = true;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `${name}${suffix}!`;

const deleteEntityMutationAttributes = {
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

export default deleteEntityMutationAttributes;
