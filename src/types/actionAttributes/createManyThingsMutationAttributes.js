// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import createThingCreateInputType from '../inputs/createThingCreateInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `createManyThings${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `createMany${pluralize(baseName)}${suffix}`;

const inputCreators = [createThingCreateInputType];

const argNames = ['data'];

const argTypes = [(name: string): string => `[${name}CreateInput!]!`];

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  !(thingConfig.embedded || thingConfig.file);

const actionReturnString =
  (suffix: string): ((thingConfig: ThingConfig) => string) =>
  ({ name }) =>
    `[${name}${suffix}!]!`;

const createManyThingsMutationAttributes = {
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

export default createManyThingsMutationAttributes;
