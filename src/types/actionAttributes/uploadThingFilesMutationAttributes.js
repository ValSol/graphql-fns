// @flow

import type { InputCreator, ThingConfig } from '../../flowTypes';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `uploadThingFiles${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `upload${baseName}Files${suffix}`;

const inputCreators = [
  (): [string, string, { [inputSpecificName: string]: [InputCreator, ThingConfig] }] => [
    '',
    '[Upload!]!',
    {},
  ],
  (): [string, string, { [inputSpecificName: string]: [InputCreator, ThingConfig] }] => [
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

const actionAllowed = (derivativeConfig: ThingConfig): boolean => Boolean(derivativeConfig.file);

const actionReturnString = (suffix: string): ((thingConfig: ThingConfig) => string) => ({ name }) =>
  `[${name}${suffix}!]!`;

const uploadThingFilesMutationAttributes = {
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

export default uploadThingFilesMutationAttributes;
