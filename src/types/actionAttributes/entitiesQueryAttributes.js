// @flow

import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntitySortInputType from '../inputs/createEntitySortInputType';
import createPaginationInputType from '../inputs/createPaginationInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `entities${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `${pluralize(baseName)}${suffix}`;

const inputCreators = [
  createEntityWhereInputType,
  createEntitySortInputType,
  createPaginationInputType,
  createEntityNearInputType,
  createStringInputTypeForSearch,
];

const argNames = ['where', 'sort', 'pagination', 'near', 'search'];

const argTypes = [
  (name: string): string => `${name}WhereInput`,
  (name: string): string => `${name}SortInput`,
  (name: string): string => 'PaginationInput', // eslint-disable-line no-unused-vars
  (name: string): string => `${name}NearInput`,
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
];

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  suffix?: string,
): null | EntityConfig =>
  suffix ? composeDerivativeConfigByName(suffix, entityConfig, generalConfig) : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `[${name}${suffix}!]!`;

const entitiesQueryAttributes = {
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

export default entitiesQueryAttributes;
