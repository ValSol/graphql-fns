import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntitySortInputType from '../inputs/createEntitySortInputType';
import createPaginationInputType from '../inputs/createPaginationInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

const actionType = 'Query';

const actionGeneralName = (descendantKey: string = ''): string => `childEntities${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `child${pluralize(baseName)}${descendantKey}`;

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

const actionInvolvedEntityNames = (
  name: string,
  descendantKey: string = '',
): {
  [key: string]: string;
} => ({ inputOutputEntity: `${name}${descendantKey}` });

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  descendantKey?: string,
): null | EntityConfig =>
  descendantKey
    ? composeDescendantConfigByName(descendantKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionIsChild = 'Array';

const actionReturnString = ({ name }: EntityConfig, descendantKey: string = ''): string =>
  `[${name}${descendantKey}!]!`;

const childEntitiesQueryAttributes = {
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
  actionIsChild,
} as const;

export default childEntitiesQueryAttributes;
