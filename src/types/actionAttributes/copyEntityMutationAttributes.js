// @flow

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createCopyEntityOptionsInputType from '../inputs/createCopyEntityOptionsInputType';
import createEntityCopyWhereOnesInputType from '../inputs/createEntityCopyWhereOnesInputType';
import createEntityWhereOneToCopyInputType from '../inputs/createEntityWhereOneToCopyInputType';

const actionType = 'Mutation';

const actionGeneralName = (derivativeKey?: string = ''): string => `copyEntity${derivativeKey}`;

const actionName = (baseName: string, derivativeKey?: string = ''): string =>
  `copy${baseName}${derivativeKey}`;

const inputCreators = [
  createEntityCopyWhereOnesInputType,
  createCopyEntityOptionsInputType,
  createEntityWhereOneToCopyInputType,
];

const argNames = ['whereOnes', 'options', 'whereOne'];

const argTypes = [
  (name: string): string => `${name}CopyWhereOnesInput!`,
  (name: string): string => `copy${name}OptionsInput`,
  (name: string): string => `${name}WhereOneToCopyInput`,
];

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  derivativeKey?: string,
): null | EntityConfig =>
  derivativeKey
    ? composeDerivativeConfigByName(derivativeKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' && Boolean(createEntityCopyWhereOnesInputType(entityConfig)[1]);

const actionReturnString =
  (derivativeKey: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `${name}${derivativeKey}!`;

const copyEntityMutationAttributes = {
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

export default copyEntityMutationAttributes;
