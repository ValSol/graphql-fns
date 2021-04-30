// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import createThingWhereOneInputType from '../inputs/createThingWhereOneInputType';

const actionType = 'mutation';

const actionGeneralName = (suffix?: string = ''): string => `deleteManyThings${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `deleteMany${pluralize(baseName)}${suffix}`;

const inputCreators = [createThingWhereOneInputType];

const argNames = ['whereOne'];

const argTypes = [(name: string): string => `[${name}WhereOneInput!]!`];

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  !(thingConfig.embedded || thingConfig.file);

const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  `[${name}${suffix}!]!`;

const deleteThingMutationAttributes = {
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

export default deleteThingMutationAttributes;
