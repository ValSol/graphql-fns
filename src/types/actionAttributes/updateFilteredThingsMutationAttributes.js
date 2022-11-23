// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from '../inputs/createThingWhereInputType';
import createThingNearInputType from '../inputs/createThingNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createThingUpdateInputType from '../inputs/createThingUpdateInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `updateFilteredThings${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `updateFiltered${pluralize(baseName)}${suffix}`;

const inputCreators = [
  createThingWhereInputType,
  createThingNearInputType,
  createStringInputTypeForSearch,
  createThingUpdateInputType,
];

const argNames = ['where', 'near', 'search', 'data'];

const argTypes = [
  (name: string): string => `${name}WhereInput`,
  (name: string): string => `${name}NearInput`,
  (): string => 'String',
  (name: string): string => `${name}UpdateInput!`,
];

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean => thingConfig.type === 'tangible';

const actionReturnString =
  (suffix: string): ((thingConfig: ThingConfig) => string) =>
  ({ name }) =>
    `[${name}${suffix}!]!`;

const updateFilteredThingsMutationAttributes = {
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

export default updateFilteredThingsMutationAttributes;
