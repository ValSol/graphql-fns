// @flow

import type { InputCreator, EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';

const actionType = 'Mutation';

const actionGeneralName = (derivativeKey?: string = ''): string =>
  `uploadEntityFiles${derivativeKey}`;

const actionName = (baseName: string, derivativeKey?: string = ''): string =>
  `upload${baseName}Files${derivativeKey}`;

const inputCreators = [
  (): [string, string, { [inputSpecificName: string]: [InputCreator, EntityConfig] }] => [
    '',
    '[Upload!]!',
    {},
  ],
  (): [string, string, { [inputSpecificName: string]: [InputCreator, EntityConfig] }] => [
    '',
    '[String!]!',
    {},
  ],
];

const argNames = ['files', 'hashes'];

const argTypes = [
  (name: string): string => `[Upload!]!`, // eslint-disable-line no-unused-vars
  (name: string): string => '[String!]!', // eslint-disable-line no-unused-vars
];

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  derivativeKey?: string,
): null | EntityConfig =>
  derivativeKey
    ? composeDerivativeConfigByName(derivativeKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  Boolean(entityConfig.type === 'tangibleFile');

const actionReturnString =
  (derivativeKey: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `[${name}${derivativeKey}!]!`;

const uploadEntityFilesMutationAttributes = {
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

export default uploadEntityFilesMutationAttributes;
