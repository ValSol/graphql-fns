// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from '../inputs/createThingWhereInputType';
import createThingSortInputType from '../inputs/createThingSortInputType';
import createPaginationInputType from '../inputs/createPaginationInputType';
import createThingNearInputType from '../inputs/createThingNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

const actionType = 'query';

const actionGeneralName = (suffix?: string = ''): string => `childThings${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `child${pluralize(baseName)}${suffix}`;

const inputCreators = [
  createThingWhereInputType,
  createThingSortInputType,
  createPaginationInputType,
  createThingNearInputType,
  createStringInputTypeForSearch,
];

const argNames = ['where', 'sort', 'pagination', 'near', 'search'];

const argTypes = [
  (name: string): string => `${name}WhereInput!`,
  (name: string): string => `${name}SortInput`,
  (name: string): string => 'PaginationInput', // eslint-disable-line no-unused-vars
  (name: string): string => `${name}NearInput`,
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
];

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  !(thingConfig.embedded || thingConfig.file);

const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  `[${name}${suffix}!]!`;

const childThingsQueryAttributes = {
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

export default childThingsQueryAttributes;
