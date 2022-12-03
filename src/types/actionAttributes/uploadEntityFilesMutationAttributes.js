// @flow

import type { InputCreator, EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `uploadEntityFiles${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `upload${baseName}Files${suffix}`;

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
  suffix?: string,
): null | EntityConfig =>
  suffix ? composeDerivativeConfigByName(suffix, entityConfig, generalConfig) : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  Boolean(entityConfig.type === 'file' && entityConfig.name.startsWith('Root'));

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `[${name}${suffix}!]!`;

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
