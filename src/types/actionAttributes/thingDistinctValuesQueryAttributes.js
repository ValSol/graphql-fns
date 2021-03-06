// @flow

import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from '../inputs/createThingWhereInputType';
import createThingDistinctValuesOptionsInputType from '../inputs/createThingDistinctValuesOptionsInputType';

const actionType = 'query';

const actionGeneralName = (suffix?: string = ''): string => `thingDistinctValues${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `${baseName}DistinctValues${suffix}`;

const inputCreators = [createThingWhereInputType, createThingDistinctValuesOptionsInputType];

const argNames = ['where', 'options'];

const argTypes = [
  (name: string): string => `${name}WhereInput`,
  (name: string): string => `${name}DistinctValuesOptionsInput`,
];

const actionReturnConfig = false;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  !(thingConfig.embedded || thingConfig.file) &&
  Boolean(createThingDistinctValuesOptionsInputType(thingConfig)[1]);

// eslint-disable-next-line no-unused-vars
const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  '[String!]!';

const thingDistinctValuesQueryAttributes = {
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

export default thingDistinctValuesQueryAttributes;
