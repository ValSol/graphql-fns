import type {EntityConfig, GeneralConfig} from '../../tsTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';

const actionType = 'Mutation';

const actionGeneralName = (derivativeKey: string = ''): string => `deleteEntity${derivativeKey}`;

const actionName = (baseName: string, derivativeKey: string = ''): string => `delete${baseName}${derivativeKey}`;

const inputCreators = [createEntityWhereOneInputType];

const argNames = ['whereOne'];

const argTypes = [(name: string): string => `${name}WhereOneInput!`];

const actionInvolvedEntityNames = (name: string, derivativeKey: string = ''): {
  [key: string]: string
} => ({
  inputOutputEntity: `${name}${derivativeKey}`,
  subscribeDeletedEntity: name,
});

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  derivativeKey?: string,
): null | EntityConfig => derivativeKey
  ? composeDerivativeConfigByName(derivativeKey, entityConfig, generalConfig)
  : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = (
  {
    name,
  }: EntityConfig,
  derivativeKey: string = '',
): string => `${name}${derivativeKey}!`;

const deleteEntityMutationAttributes = {
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

export default deleteEntityMutationAttributes;
