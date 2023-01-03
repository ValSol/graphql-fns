// @flow

import type { InputCreator, EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createUploadFilesToEntityInputType from '../inputs/createUploadFilesToEntityInputType';
import createFilesOfEntityOptionsInputType from '../inputs/createFilesOfEntityOptionsInputType';
import createEntityReorderUploadedInputType from '../inputs/createEntityReorderUploadedInputType';

const actionType = 'Mutation';

const actionGeneralName = (derivativeKey?: string = ''): string =>
  `uploadFilesToEntity${derivativeKey}`;

const actionName = (baseName: string, derivativeKey?: string = ''): string =>
  `uploadFilesTo${baseName}${derivativeKey}`;

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

const actionInvolvedEntityNames = (
  name: string,
  derivativeKey?: string = '',
): { [key: string]: string } => ({
  mainEntity: `${name}${derivativeKey}`,
});

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  derivativeKey?: string,
): null | EntityConfig =>
  derivativeKey
    ? composeDerivativeConfigByName(derivativeKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' && Boolean(createFilesOfEntityOptionsInputType(entityConfig)[1]); // eslint-disable-line no-unused-vars

const actionReturnString =
  (derivativeKey: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `${name}${derivativeKey}!`;

const uploadFilesToEntityMutationAttributes = {
  actionGeneralName,
  actionType,
  actionName,
  inputCreators,
  argNames,
  argTypes,
  actionInvolvedEntityNames,
  actionReturnString,
  actionReturnConfig,
  actionAllowed,
};

export default uploadFilesToEntityMutationAttributes;
