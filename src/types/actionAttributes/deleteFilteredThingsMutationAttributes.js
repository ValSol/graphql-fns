// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from '../inputs/createThingWhereInputType';
import createThingNearInputType from '../inputs/createThingNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `deleteFilteredThings${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `deleteFiltered${pluralize(baseName)}${suffix}`;

const inputCreators = [
  createThingWhereInputType,
  createThingNearInputType,
  createStringInputTypeForSearch,
];

const argNames = ['where', 'near', 'search'];

const argTypes = [
  (name: string): string => `${name}WhereInput`,
  (name: string): string => `${name}NearInput`,
  (): string => 'String',
];

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean => thingConfig.type === 'tangible';

const actionReturnString =
  (suffix: string): ((thingConfig: ThingConfig) => string) =>
  ({ name }) =>
    `[${name}${suffix}!]!`;

const deleteFilteredThingsMutationAttributes = {
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

export default deleteFilteredThingsMutationAttributes;
