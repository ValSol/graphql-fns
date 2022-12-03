// @flow

import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `deleteManyEntities${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `deleteMany${pluralize(baseName)}${suffix}`;

const inputCreators = [createEntityWhereOneInputType];

const argNames = ['whereOne'];

const argTypes = [(name: string): string => `[${name}WhereOneInput!]!`];

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

const deleteManyEntitiesMutationAttributes = {
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

export default deleteManyEntitiesMutationAttributes;
