// @flow

import pluralize from 'pluralize';

import type { InputCreator, EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createImportOptionsInputTypes from '../inputs/createImportOptionsInputTypes';

const actionType = 'Mutation';

const actionGeneralName = (derivativeKey?: string = ''): string => `importEntities${derivativeKey}`;

const actionName = (baseName: string, derivativeKey?: string = ''): string =>
  `import${pluralize(baseName)}${derivativeKey}`;

const inputCreators = [
  (): [string, string, { [inputSpecificName: string]: [InputCreator, EntityConfig] }] => [
    '',
    'Upload!',
    {},
  ],
  createImportOptionsInputTypes,
];

const argNames = ['file', 'options'];

const argTypes = [
  (name: string): string => 'Upload!', // eslint-disable-line no-unused-vars
  (name: string): string => 'ImportOptionsInput', // eslint-disable-line no-unused-vars
];

const actionInvolvedEntityNames = (
  name: string,
  derivativeKey?: string = '',
): { [key: string]: string } => ({
  inputOutputEntity: `${name}${derivativeKey}`,
});

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  derivativeKey?: string,
): null | EntityConfig =>
  derivativeKey
    ? composeDerivativeConfigByName(derivativeKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString =
  (derivativeKey: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `[${name}${derivativeKey}!]!`;

const importEntitiesMutationAttributes = {
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

export default importEntitiesMutationAttributes;
