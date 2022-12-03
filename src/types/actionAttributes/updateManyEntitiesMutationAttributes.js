// @flow

import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createEntityUpdateInputType from '../inputs/createEntityUpdateInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `updateManyEntities${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `updateMany${pluralize(baseName)}${suffix}`;

const inputCreators = [createEntityWhereOneInputType, createEntityUpdateInputType];

const argNames = ['whereOne', 'data'];

const argTypes = [
  (name: string): string => `[${name}WhereOneInput!]!`,
  (name: string): string => `[${name}UpdateInput!]!`,
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

const updateManyEntitiesMutationAttributes = {
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

export default updateManyEntitiesMutationAttributes;
