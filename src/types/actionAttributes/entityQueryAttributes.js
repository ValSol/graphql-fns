// @flow

import type { EntityConfig } from '../../flowTypes';

import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `entity${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string => `${baseName}${suffix}`;

const inputCreators = [createEntityWhereOneInputType];

const argNames = ['whereOne'];

const argTypes = [(name: string): string => `${name}WhereOneInput!`];

const actionReturnConfig = true;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `${name}${suffix}!`;

const entityQueryAttributes = {
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

export default entityQueryAttributes;
