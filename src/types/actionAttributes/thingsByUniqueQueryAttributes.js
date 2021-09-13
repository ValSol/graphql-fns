// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import createThingWhereByUniqueInputType from '../inputs/createThingWhereByUniqueInputType';
import createThingSortInputType from '../inputs/createThingSortInputType';
import createThingNearInputType from '../inputs/createThingNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `thingsByUnique${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `${pluralize(baseName)}ByUnique${suffix}`;

const inputCreators = [
  createThingWhereByUniqueInputType,
  createThingSortInputType,
  createThingNearInputType,
  createStringInputTypeForSearch,
];

const argNames = ['where', 'sort', 'near', 'search'];

const argTypes = [
  (name: string): string => `${name}WhereByUniqueInput!`,
  (name: string): string => `${name}SortInput`,
  (name: string): string => `${name}NearInput`,
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
];

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  !(thingConfig.embedded || thingConfig.file);

const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  `[${name}${suffix}!]!`;

const thingsByUniqueQueryAttributes = {
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

export default thingsByUniqueQueryAttributes;
