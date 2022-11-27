// @flow

import pluralize from 'pluralize';

import type { EntityConfig } from '../../flowTypes';

import createEntityWhereByUniqueInputType from '../inputs/createEntityWhereByUniqueInputType';
import createEntitySortInputType from '../inputs/createEntitySortInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `entitiesByUnique${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `${pluralize(baseName)}ByUnique${suffix}`;

const inputCreators = [
  createEntityWhereByUniqueInputType,
  createEntitySortInputType,
  createEntityNearInputType,
  createStringInputTypeForSearch,
];

const argNames = ['where', 'sort', 'near', 'search'];

const argTypes = [
  (name: string): string => `${name}WhereByUniqueInput!`,
  (name: string): string => `${name}SortInput`,
  (name: string): string => `${name}NearInput`,
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
];

const actionReturnConfig = true;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `[${name}${suffix}!]!`;

const entitiesByUniqueQueryAttributes = {
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

export default entitiesByUniqueQueryAttributes;
