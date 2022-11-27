// @flow

import type { EntityConfig } from '../../flowTypes';

import createFileWhereOneInputType from '../inputs/createFileWhereOneInputType';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `entityFile${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string => `${baseName}File${suffix}`;

const inputCreators = [createFileWhereOneInputType];

const argNames = ['whereOne'];

const argTypes = [(name: string): string => 'FileWhereOneInput!']; // eslint-disable-line no-unused-vars

const actionReturnConfig = true;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  Boolean(entityConfig.type === 'file' && entityConfig.name.startsWith('Root'));

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `${name}${suffix}!`;

const entityFileQueryAttributes = {
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

export default entityFileQueryAttributes;
