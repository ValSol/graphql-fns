// @flow

import pluralize from 'pluralize';

import type { InputCreator, ThingConfig } from '../../flowTypes';

import createImportOptionsInputTypes from '../inputs/createImportOptionsInputTypes';

const actionType = 'mutation';

const actionGeneralName = (suffix?: string = ''): string => `importThings${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `import${pluralize(baseName)}${suffix}`;

const inputCreators = [
  (): [string, string, { [inputSpecificName: string]: [InputCreator, ThingConfig] }] => [
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

const actionReturnConfig = true;

const actionAllowed = (thingConfig: ThingConfig): boolean =>
  !(thingConfig.embedded || thingConfig.file);

const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  `[${name}${suffix}!]!`;

const importThingsMutationAttributes = {
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

export default importThingsMutationAttributes;
