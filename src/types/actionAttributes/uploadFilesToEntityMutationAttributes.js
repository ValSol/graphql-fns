// @flow

import type { InputCreator, EntityConfig } from '../../flowTypes';

import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createUploadFilesToEntityInputType from '../inputs/createUploadFilesToEntityInputType';
import createFilesOfEntityOptionsInputType from '../inputs/createFilesOfEntityOptionsInputType';
import createEntityReorderUploadedInputType from '../inputs/createEntityReorderUploadedInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `uploadFilesToEntity${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `uploadFilesTo${baseName}${suffix}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createUploadFilesToEntityInputType,
  (): [string, string, { [inputSpecificName: string]: [InputCreator, EntityConfig] }] => [
    '',
    '[Upload!]!',
    {},
  ],
  createFilesOfEntityOptionsInputType,
  createEntityReorderUploadedInputType,
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

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' && Boolean(createFilesOfEntityOptionsInputType(entityConfig)[1]); // eslint-disable-line no-unused-vars

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `${name}${suffix}!`;

const uploadFilesToEntityMutationAttributes = {
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

export default uploadFilesToEntityMutationAttributes;
