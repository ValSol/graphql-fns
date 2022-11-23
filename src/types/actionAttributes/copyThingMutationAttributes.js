// @flow

import type { ThingConfig } from '../../flowTypes';

import createCopyThingOptionsInputType from '../inputs/createCopyThingOptionsInputType';
import createThingCopyWhereOnesInputType from '../inputs/createThingCopyWhereOnesInputType';
import createThingWhereOneToCopyInputType from '../inputs/createThingWhereOneToCopyInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `copyThing${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string => `copy${baseName}${suffix}`;

const inputCreators = [
  createThingCopyWhereOnesInputType,
  createCopyThingOptionsInputType,
  createThingWhereOneToCopyInputType,
];

const argNames = ['whereOnes', 'options', 'whereOne'];

const argTypes = [
  (name: string): string => `${name}CopyWhereOnesInput!`,
  (name: string): string => `copy${name}OptionsInput`,
  (name: string): string => `${name}WhereOneToCopyInput`,
];

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  thingConfig.type === 'tangible' && Boolean(createThingCopyWhereOnesInputType(thingConfig)[1]);

const actionReturnString =
  (suffix: string): ((thingConfig: ThingConfig) => string) =>
  ({ name }) =>
    `${name}${suffix}!`;

const copyThingMutationAttributes = {
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

export default copyThingMutationAttributes;
