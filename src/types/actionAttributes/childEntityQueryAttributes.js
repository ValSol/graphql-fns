// @flow

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `childEntity${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string => `child${baseName}${suffix}`;

const inputCreators = [createEntityWhereOneInputType];

const argNames = ['whereOne'];

const argTypes = [(name: string): string => `${name}WhereOneInput!`];

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
    `${name}${suffix}!`;

const childEntityQueryAttributes = {
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

export default childEntityQueryAttributes;
