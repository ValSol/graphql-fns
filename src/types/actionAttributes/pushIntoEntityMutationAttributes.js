// @flow

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createPushIntoEntityInputType from '../inputs/createPushIntoEntityInputType';
import createEntityPushPositionsInputType from '../inputs/createEntityPushPositionsInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `pushIntoEntity${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `pushInto${baseName}${suffix}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createPushIntoEntityInputType,
  createEntityPushPositionsInputType,
];

const argNames = ['whereOne', 'data', 'positions'];

const argTypes = [
  (name: string): string => `${name}WhereOneInput!`,
  (name: string): string => `PushInto${name}Input!`,
  (name: string): string => `${name}PushPositionsInput`,
];

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  suffix?: string,
): null | EntityConfig =>
  suffix ? composeDerivativeConfigByName(suffix, entityConfig, generalConfig) : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' && Boolean(createPushIntoEntityInputType(entityConfig)[1]);

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `${name}${suffix}!`;

const pushIntoEntityMutationAttributes = {
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

export default pushIntoEntityMutationAttributes;
