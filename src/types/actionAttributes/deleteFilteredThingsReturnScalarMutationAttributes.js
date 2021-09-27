// @flow

import pluralize from 'pluralize';

import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from '../inputs/createThingWhereInputType';
import createThingNearInputType from '../inputs/createThingNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string =>
  `deleteFilteredThingsReturnScalar${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `deleteFiltered${pluralize(baseName)}ReturnScalar${suffix}`;

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

const actionReturnConfig = false;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  !(thingConfig.embedded || thingConfig.file);

// eslint-disable-next-line no-unused-vars
const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  'Int!';

const deleteFilteredThingsReturnScalarMutationAttributes = {
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

export default deleteFilteredThingsReturnScalarMutationAttributes;
