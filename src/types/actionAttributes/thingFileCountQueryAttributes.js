// @flow

import type { ThingConfig } from '../../flowTypes';

import createFileWhereInputType from '../inputs/createFileWhereInputType';

const actionType = 'query';

const actionGeneralName = (suffix?: string = ''): string => `thingFileCount${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `${baseName}FileCount${suffix}`;

const inputCreators = [createFileWhereInputType];

const argNames = ['where'];

const argTypes = [(name: string): string => 'FileWhereInput']; // eslint-disable-line no-unused-vars

const actionReturnConfig = false;

const actionAllowed = (thingConfig: ThingConfig): boolean => Boolean(thingConfig.file);

// eslint-disable-next-line no-unused-vars
const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  'Int!';

const thingFileCountQueryAttributes = {
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

export default thingFileCountQueryAttributes;
