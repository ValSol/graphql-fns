// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import createThingWhereOneInputType from '../inputs/createThingWhereOneInputType';
import createThingUpdateInputType from '../inputs/createThingUpdateInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `updateManyThings${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `updateMany${pluralize(baseName)}${suffix}`;

const inputCreators = [createThingWhereOneInputType, createThingUpdateInputType];

const argNames = ['whereOne', 'data'];

const argTypes = [
  (name: string): string => `[${name}WhereOneInput!]!`,
  (name: string): string => `[${name}UpdateInput!]!`,
];

const actionReturnConfig = true;

const actionAllowed = (derivativeConfig: ThingConfig): boolean =>
  !(derivativeConfig.embedded || derivativeConfig.file);

const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  `[${name}${suffix}!]!`;

const updateManyThingsMutationAttributes = {
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

export default updateManyThingsMutationAttributes;
