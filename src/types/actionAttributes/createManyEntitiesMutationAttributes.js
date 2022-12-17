// @flow

import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createEntityCreateInputType from '../inputs/createEntityCreateInputType';

const actionType = 'Mutation';

const actionGeneralName = (derivativeKey?: string = ''): string =>
  `createManyEntities${derivativeKey}`;

const actionName = (baseName: string, derivativeKey?: string = ''): string =>
  `createMany${pluralize(baseName)}${derivativeKey}`;

const inputCreators = [createEntityCreateInputType];

const argNames = ['data'];

const argTypes = [(name: string): string => `[${name}CreateInput!]!`];

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  derivativeKey?: string,
): null | EntityConfig =>
  derivativeKey
    ? composeDerivativeConfigByName(derivativeKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString =
  (derivativeKey: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `[${name}${derivativeKey}!]!`;

const createManyEntitiesMutationAttributes = {
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

export default createManyEntitiesMutationAttributes;
