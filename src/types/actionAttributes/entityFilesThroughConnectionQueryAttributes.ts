import type {EntityConfig, GeneralConfig, InputCreator} from '../../tsTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import createFileWhereInputType from '../inputs/createFileWhereInputType';
import connectionDerivativeUpdater from '../actionDerivativeUpdaters/connectionDerivativeUpdater';

const actionType = 'Query';

const actionGeneralName = (derivativeKey: string = ''): string => `entityFilesThroughConnection${derivativeKey}`;

const actionName = (baseName: string, derivativeKey: string = ''): string => `${baseName}FilesThroughConnection${derivativeKey}`;

const inputCreators = [
  createFileWhereInputType,
  (): [string, string, {
    [inputSpecificName: string]: [InputCreator, EntityConfig]
  }] => [
    '',
    'String',
    {},
  ],
  (): [string, string, {
    [inputSpecificName: string]: [InputCreator, EntityConfig]
  }] => [
    '',
    'String',
    {},
  ],
  (): [string, string, {
    [inputSpecificName: string]: [InputCreator, EntityConfig]
  }] => [
    '',
    'Int',
    {},
  ],
  (): [string, string, {
    [inputSpecificName: string]: [InputCreator, EntityConfig]
  }] => [
    '',
    'Int',
    {},
  ],
];

const argNames = ['where', 'after', 'before', 'first', 'last'];

const argTypes = [
  (name: string): string => 'FileWhereInput', // eslint-disable-line no-unused-vars
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
  (name: string): string => 'Int', // eslint-disable-line no-unused-vars
  (name: string): string => 'Int', // eslint-disable-line no-unused-vars
];

const actionInvolvedEntityNames = (name: string, derivativeKey: string = ''): {
  [key: string]: string
} => ({ inputOutputEntity: `${name}${derivativeKey}` });

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  derivativeKey?: string,
): null | EntityConfig => {
  const { name } = entityConfig;

  const { allEntityConfigs } = generalConfig;

  const connectionConfigName = `${name}Connection`;

  const connectionConfig = allEntityConfigs[connectionConfigName];

  return derivativeKey
    ? composeDerivativeConfigByName(derivativeKey, connectionConfig, generalConfig)
    : connectionConfig;
};

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangibleFile';

const actionReturnString = (
  {
    name,
  }: EntityConfig,
  derivativeKey: string = '',
): string => `${name}Connection${derivativeKey}`;

const entityFilesThroughConnectionQueryAttributes = {
  actionGeneralName,
  actionType,
  actionName,
  inputCreators,
  argNames,
  argTypes,
  actionInvolvedEntityNames,
  actionReturnString,
  actionReturnConfig,
  actionDerivativeUpdater: connectionDerivativeUpdater,
  actionAllowed,
} as const;

export default entityFilesThroughConnectionQueryAttributes;
