// @flow

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createEntityCreateInputType from '../inputs/createEntityCreateInputType';

const actionType = 'Mutation';

const actionGeneralName = (derivativeKey?: string = ''): string => `createEntity${derivativeKey}`;

const actionName = (baseName: string, derivativeKey?: string = ''): string =>
  `create${baseName}${derivativeKey}`;

const inputCreators = [createEntityCreateInputType];

const argNames = ['data'];

const argTypes = [(name: string): string => `${name}CreateInput!`];

const actionInvolvedEntityNames = (
  name: string,
  derivativeKey?: string = '',
): { [key: string]: string } => ({
  inputEntity: `${name}${derivativeKey}`,
  outputEntity: `${name}${derivativeKey}`,
  subscribeCreatedEntity: name,
});

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
    `${name}${derivativeKey}!`;

const createEntityMutationAttributes = {
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
};

export default createEntityMutationAttributes;
