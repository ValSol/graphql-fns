// @flow

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createCopyEntityOptionsInputType from '../inputs/createCopyEntityOptionsInputType';
import createEntityCopyWhereOnesInputType from '../inputs/createEntityCopyWhereOnesInputType';
import createEntityWhereOneToCopyInputType from '../inputs/createEntityWhereOneToCopyInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `copyEntity${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string => `copy${baseName}${suffix}`;

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
  suffix?: string,
): null | EntityConfig =>
  suffix ? composeDerivativeConfigByName(suffix, entityConfig, generalConfig) : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' && Boolean(createEntityCopyWhereOnesInputType(entityConfig)[1]);

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `${name}${suffix}!`;

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
