import type { InputCreator, EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';

const actionType = 'Mutation';

const actionGeneralName = (descendantKey: string = ''): string =>
  `uploadEntityFiles${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `upload${baseName}Files${descendantKey}`;

const inputCreators = [
  (): [
    string,
    string,
    {
      [inputSpecificName: string]: [InputCreator, EntityConfig];
    },
  ] => ['', '[Upload!]!', {}],
  (): [
    string,
    string,
    {
      [inputSpecificName: string]: [InputCreator, EntityConfig];
    },
  ] => ['', '[String!]!', {}],
];

const argNames = ['files', 'hashes'];

const argTypes = [
  (name: string): string => `[Upload!]!`, // eslint-disable-line no-unused-vars
  (name: string): string => '[String!]!', // eslint-disable-line no-unused-vars
];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey: string = '',
): {
  [key: string]: string;
} => ({
  inputOutputEntity: `${name}${descendantKey}`,
});

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  descendantKey?: string,
): null | EntityConfig =>
  descendantKey
    ? composeDescendantConfigByName(descendantKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  Boolean(entityConfig.type === 'tangibleFile');

const actionReturnString = ({ name }: EntityConfig, descendantKey: string = ''): string =>
  `[${name}${descendantKey}!]!`;

const uploadEntityFilesMutationAttributes = {
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
} as const;

export default uploadEntityFilesMutationAttributes;
