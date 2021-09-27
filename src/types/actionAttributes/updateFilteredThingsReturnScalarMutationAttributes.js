// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from '../inputs/createThingWhereInputType';
import createThingNearInputType from '../inputs/createThingNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createThingUpdateInputType from '../inputs/createThingUpdateInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string =>
  `updateFilteredThingsReturnScalar${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `updateFiltered${pluralize(baseName)}ReturnScalar${suffix}`;

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

const actionReturnConfig = false;

const actionAllowed = (derivativeConfig: ThingConfig): boolean =>
  !(derivativeConfig.embedded || derivativeConfig.file);

// eslint-disable-next-line no-unused-vars
const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  'Int!';

const updateFilteredThingsReturnScalarMutationAttributes = {
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

export default updateFilteredThingsReturnScalarMutationAttributes;
