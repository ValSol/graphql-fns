// @flow

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createFileWhereInputType from '../inputs/createFileWhereInputType';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `entityFiles${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string => `${baseName}Files${suffix}`;

const inputCreators = [createFileWhereInputType];

const argNames = ['where'];

const argTypes = [(name: string): string => 'FileWhereInput']; // eslint-disable-line no-unused-vars

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  suffix?: string,
): null | EntityConfig =>
  suffix ? composeDerivativeConfigByName(suffix, entityConfig, generalConfig) : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  Boolean(entityConfig.type === 'tangibleFile');

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `[${name}${suffix}!]!`;

const entityFilesQueryAttributes = {
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

export default entityFilesQueryAttributes;
