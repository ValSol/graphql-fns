// @flow

import type { EntityConfig } from '../../flowTypes';

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

const actionReturnConfig = true;

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
