// @flow

import type { ThingConfig } from '../../flowTypes';

import createFileWhereInputType from '../inputs/createFileWhereInputType';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `thingFiles${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string => `${baseName}Files${suffix}`;

const inputCreators = [createFileWhereInputType];

const argNames = ['where'];

const argTypes = [(name: string): string => 'FileWhereInput']; // eslint-disable-line no-unused-vars

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  Boolean(thingConfig.type === 'file' && thingConfig.name.startsWith('Root'));

const actionReturnString =
  (suffix: string): ((thingConfig: ThingConfig) => string) =>
  ({ name }) =>
    `[${name}${suffix}!]!`;

const thingFilesQueryAttributes = {
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

export default thingFilesQueryAttributes;
