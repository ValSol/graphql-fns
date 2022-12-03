// @flow

import pluralize from 'pluralize';

import type { InputCreator, EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createImportOptionsInputTypes from '../inputs/createImportOptionsInputTypes';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `importEntities${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `import${pluralize(baseName)}${suffix}`;

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

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  suffix?: string,
): null | EntityConfig =>
  suffix ? composeDerivativeConfigByName(suffix, entityConfig, generalConfig) : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `[${name}${suffix}!]!`;

const importEntitiesMutationAttributes = {
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

export default importEntitiesMutationAttributes;
