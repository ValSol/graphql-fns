// @flow

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import createFileWhereInputType from '../inputs/createFileWhereInputType';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `entityFileCount${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `${baseName}FileCount${suffix}`;

const inputCreators = [createFileWhereInputType];

const argNames = ['where'];

const argTypes = [(name: string): string => 'FileWhereInput']; // eslint-disable-line no-unused-vars

const actionReturnConfig = (
  entityConfig: EntityConfig, // eslint-disable-line no-unused-vars
  generalConfig: GeneralConfig, // eslint-disable-line no-unused-vars
  suffix?: string, // eslint-disable-line no-unused-vars
): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  Boolean(entityConfig.type === 'file' && entityConfig.name.startsWith('Root'));

const actionReturnString =
  (
    // eslint-disable-next-line no-unused-vars
    suffix: string,
  ): ((entityConfig: EntityConfig) => string) =>
  // eslint-disable-next-line no-unused-vars
  ({ name }) =>
    'Int!';

const entityFileCountQueryAttributes = {
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

export default entityFileCountQueryAttributes;
