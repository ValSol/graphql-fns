// @flow

import type { InputCreator, EntityConfig } from '../../flowTypes';

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

const actionReturnConfig = true;

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
