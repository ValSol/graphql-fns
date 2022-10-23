// @flow

import type { InputCreator, ThingConfig } from '../../flowTypes';

import createThingWhereOneInputType from '../inputs/createThingWhereOneInputType';
import createUploadFilesToThingInputType from '../inputs/createUploadFilesToThingInputType';
import createFilesOfThingOptionsInputType from '../inputs/createFilesOfThingOptionsInputType';
import createThingReorderUploadedInputType from '../inputs/createThingReorderUploadedInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `uploadFilesToThing${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `uploadFilesTo${baseName}${suffix}`;

const inputCreators = [
  createThingWhereOneInputType,
  createUploadFilesToThingInputType,
  (): [string, string, { [inputSpecificName: string]: [InputCreator, ThingConfig] }] => [
    '',
    '[Upload!]!',
    {},
  ],
  createFilesOfThingOptionsInputType,
  createThingReorderUploadedInputType,
];

const argNames = ['whereOne', 'data', 'files', 'options', 'positions'];

const argTypes = [
  (name: string): string => `${name}WhereOneInput!`,
  (name: string): string => `UploadFilesTo${name}Input`,
  (name: string): string => `[Upload!]!`, // eslint-disable-line no-unused-vars
  (name: string): string => `FilesOf${name}OptionsInput!`,
  (name: string): string => `${name}ReorderUploadedInput`,
];

const actionReturnConfig = true;

const actionAllowed = (derivativeConfig: ThingConfig): boolean =>
  !(derivativeConfig.embedded || derivativeConfig.file) &&
  Boolean(createFilesOfThingOptionsInputType(derivativeConfig)[1]); // eslint-disable-line no-unused-vars

const actionReturnString =
  (suffix: string): ((thingConfig: ThingConfig) => string) =>
  ({ name }) =>
    `${name}${suffix}!`;

const uploadFilesToThingMutationAttributes = {
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

export default uploadFilesToThingMutationAttributes;
