import type {EntityConfig, GeneralConfig} from '../../tsTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createFileWhereOneInputType from '../inputs/createFileWhereOneInputType';

const actionType = 'Query';

const actionGeneralName = (derivativeKey: string = ''): string => `entityFile${derivativeKey}`;

const actionName = (baseName: string, derivativeKey: string = ''): string => `${baseName}File${derivativeKey}`;

const inputCreators = [createFileWhereOneInputType];

const argNames = ['whereOne'];

const argTypes = [(name: string): string => 'FileWhereOneInput!']; // eslint-disable-line no-unused-vars

const actionInvolvedEntityNames = (name: string, derivativeKey: string = ''): {
  [key: string]: string
} => ({ inputOutputEntity: `${name}${derivativeKey}` });

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  derivativeKey?: string,
): null | EntityConfig => derivativeKey
  ? composeDerivativeConfigByName(derivativeKey, entityConfig, generalConfig)
  : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => Boolean(entityConfig.type === 'tangibleFile');

const actionReturnString = (
  {
    name,
  }: EntityConfig,
  derivativeKey: string = '',
): string => `${name}${derivativeKey}!`;

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
} as const;

export default entityFileQueryAttributes;
