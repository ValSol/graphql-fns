// @flow

import type { ThingConfig } from '../../flowTypes';

import createThingWhereOneInputType from '../inputs/createThingWhereOneInputType';
import createPushIntoThingInputType from '../inputs/createPushIntoThingInputType';
import createThingPushPositionsInputType from '../inputs/createThingPushPositionsInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `pushIntoThing${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `pushInto${baseName}${suffix}`;

const inputCreators = [
  createThingWhereOneInputType,
  createPushIntoThingInputType,
  createThingPushPositionsInputType,
];

const argNames = ['whereOne', 'data', 'positions'];

const argTypes = [
  (name: string): string => `${name}WhereOneInput!`,
  (name: string): string => `PushInto${name}Input!`,
  (name: string): string => `${name}PushPositionsInput`,
];

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  thingConfig.type === 'tangible' && Boolean(createPushIntoThingInputType(thingConfig)[1]);

const actionReturnString =
  (suffix: string): ((thingConfig: ThingConfig) => string) =>
  ({ name }) =>
    `${name}${suffix}!`;

const pushIntoThingMutationAttributes = {
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

export default pushIntoThingMutationAttributes;
