import pluralize from 'pluralize';

import type { InputCreator, EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import createImportOptionsInputTypes from '../inputs/createImportOptionsInputTypes';

const actionType = 'Mutation';

const actionGeneralName = (descendantKey: string = ''): string => `importEntities${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `import${pluralize(baseName)}${descendantKey}`;

const inputCreators = [
  (): [
    string,
    string,
    {
      [inputSpecificName: string]: [InputCreator, EntityConfig];
    },
  ] => ['', 'Upload!', {}],
  createImportOptionsInputTypes,
];

const argNames = ['file', 'options'];

const argTypes = [
  (name: string): string => 'Upload!', // eslint-disable-line no-unused-vars
  (name: string): string => 'ImportOptionsInput', // eslint-disable-line no-unused-vars
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

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, descendantKey: string = ''): string =>
  `[${name}${descendantKey}!]!`;

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
} as const;

export default importEntitiesMutationAttributes;
