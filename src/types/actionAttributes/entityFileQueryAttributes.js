// @flow

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createFileWhereOneInputType from '../inputs/createFileWhereOneInputType';

const actionType = 'Query';

const actionGeneralName = (derivativeKey?: string = ''): string => `entityFile${derivativeKey}`;

const actionName = (baseName: string, derivativeKey?: string = ''): string =>
  `${baseName}File${derivativeKey}`;

const inputCreators = [createFileWhereOneInputType];

const argNames = ['whereOne'];

const argTypes = [(name: string): string => 'FileWhereOneInput!']; // eslint-disable-line no-unused-vars

const actionInvolvedEntityNames = (
  name: string,
  derivativeKey?: string = '',
): { [key: string]: string } => ({
  mainEntity: `${name}${derivativeKey}`,
});

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
    `${name}${derivativeKey}!`;

const entityFileQueryAttributes = {
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
};

export default entityFileQueryAttributes;
