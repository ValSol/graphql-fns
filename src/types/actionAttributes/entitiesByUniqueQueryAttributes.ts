import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createEntityWhereByUniqueInputType from '../inputs/createEntityWhereByUniqueInputType';
import createEntitySortInputType from '../inputs/createEntitySortInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

const actionType = 'Query';

const actionGeneralName = (derivativeKey: string = ''): string =>
  `entitiesByUnique${derivativeKey}`;

const actionName = (baseName: string, derivativeKey: string = ''): string =>
  `${pluralize(baseName)}ByUnique${derivativeKey}`;

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

const actionInvolvedEntityNames = (
  name: string,
  derivativeKey: string = '',
): {
  [key: string]: string;
} => ({ inputOutputEntity: `${name}${derivativeKey}` });

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  derivativeKey?: string,
): null | EntityConfig =>
  derivativeKey
    ? composeDerivativeConfigByName(derivativeKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, derivativeKey: string = ''): string =>
  `[${name}${derivativeKey}!]!`;

const entitiesByUniqueQueryAttributes = {
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

export default entitiesByUniqueQueryAttributes;
