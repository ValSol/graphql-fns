// @flow

import type { ThingConfig } from '../../flowTypes';

import createThingWhereOneInputType from '../inputs/createThingWhereOneInputType';

const actionType = 'query';

const actionGeneralName = (suffix?: string = ''): string => `thing${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string => `${baseName}${suffix}`;

const inputCreators = [createThingWhereOneInputType];

const argNames = ['whereOne'];

const argTypes = [(name: string): string => `${name}WhereOneInput!`];

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  !(thingConfig.embedded || thingConfig.file);

const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  `${name}${suffix}!`;

const thingFileQueryAttributes = {
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

export default thingFileQueryAttributes;
