// @flow

import type { ThingConfig } from '../../flowTypes';

import createFileWhereOneInputType from '../inputs/createFileWhereOneInputType';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `thingFile${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string => `${baseName}File${suffix}`;

const inputCreators = [createFileWhereOneInputType];

const argNames = ['whereOne'];

const argTypes = [(name: string): string => 'FileWhereOneInput!']; // eslint-disable-line no-unused-vars

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean => Boolean(thingConfig.file);

const actionReturnString =
  (suffix: string): ((thingConfig: ThingConfig) => string) =>
  ({ name }) =>
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
