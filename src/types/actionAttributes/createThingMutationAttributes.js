// @flow

import type { ThingConfig } from '../../flowTypes';

import createThingCreateInputType from '../inputs/createThingCreateInputType';

const actionType = 'mutation';

const actionGeneralName = (suffix?: string = ''): string => `createThing${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string => `create${baseName}${suffix}`;

const inputCreators = [createThingCreateInputType];

const argNames = ['data'];

const argTypes = [(name: string): string => `${name}CreateInput!`];

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  !(thingConfig.embedded || thingConfig.file);

const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  `${name}${suffix}!`;

const deleteThingMutationAttributes = {
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

export default deleteThingMutationAttributes;
