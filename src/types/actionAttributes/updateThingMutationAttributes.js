// @flow

import type { ThingConfig } from '../../flowTypes';

import createThingWhereOneInputType from '../inputs/createThingWhereOneInputType';
import createThingUpdateInputType from '../inputs/createThingUpdateInputType';
import createThingReorderCreatedInputType from '../inputs/createThingReorderCreatedInputType';

const actionType = 'mutation';

const actionGeneralName = (suffix?: string = ''): string => `updateThing${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string => `update${baseName}${suffix}`;

const inputCreators = [
  createThingWhereOneInputType,
  createThingUpdateInputType,
  createThingReorderCreatedInputType,
];

const argNames = ['whereOne', 'data', 'positions'];

const argTypes = [
  (name: string): string => `${name}WhereOneInput!`,
  (name: string): string => `${name}UpdateInput!`,
  (name: string): string => `${name}ReorderCreatedInput`,
];

const actionReturnConfig = true;

const actionAllowed = (derivativeConfig: ThingConfig): boolean =>
  !(derivativeConfig.embedded || derivativeConfig.file);

const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  `${name}${suffix}!`;

const updateThingMutationAttributes = {
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

export default updateThingMutationAttributes;
