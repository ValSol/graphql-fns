// @flow

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import getOppositeFields from '../../utils/getOppositeFields';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createDeleteEntityWithChildrenOptionsInputType from '../inputs/createDeleteEntityWithChildrenOptionsInputType';

const actionType = 'Mutation';

const actionGeneralName = (derivativeKey?: string = ''): string =>
  `deleteEntityWithChildren${derivativeKey}`;

const actionName = (baseName: string, derivativeKey?: string = ''): string =>
  `delete${baseName}WithChildren${derivativeKey}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createDeleteEntityWithChildrenOptionsInputType,
];

const argNames = ['whereOne', 'options'];

const argTypes = [
  (name: string): string => `${name}WhereOneInput!`,
  (name: string): string => `delete${name}WithChildrenOptionsInput`,
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
  entityConfig.type === 'tangible' &&
  Boolean(
    getOppositeFields(entityConfig).filter(([, { array, parent }]) => !(array || parent)).length,
  );

const actionReturnString =
  (derivativeKey: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `${name}${derivativeKey}!`;

const deleteEntityWithChildrenMutationAttributes = {
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

export default deleteEntityWithChildrenMutationAttributes;
