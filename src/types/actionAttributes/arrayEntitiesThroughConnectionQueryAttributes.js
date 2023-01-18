// @flow

import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig, InputCreator } from '../../flowTypes';

import composeDerivativeConfig from '../../utils/composeDerivativeConfig';
import connectionDerivativeUpdater from '../actionDerivativeUpdaters/connectionDerivativeUpdater';

const actionType = 'Query';

const actionGeneralName = (derivativeKey?: string = ''): string =>
  `childEntitiesThroughConnection${derivativeKey}`;

const actionName = (baseName: string, derivativeKey?: string = ''): string =>
  `child${pluralize(baseName)}ThroughConnection${derivativeKey}`;

const inputCreators = [
  (): [string, string, { [inputSpecificName: string]: [InputCreator, EntityConfig] }] => [
    '',
    'String',
    {},
  ],
  (): [string, string, { [inputSpecificName: string]: [InputCreator, EntityConfig] }] => [
    '',
    'String',
    {},
  ],
  (): [string, string, { [inputSpecificName: string]: [InputCreator, EntityConfig] }] => [
    '',
    'Int',
    {},
  ],
  (): [string, string, { [inputSpecificName: string]: [InputCreator, EntityConfig] }] => [
    '',
    'Int',
    {},
  ],
];

const argNames = ['after', 'before', 'first', 'last'];

const argTypes = [
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
  (name: string): string => 'Int', // eslint-disable-line no-unused-vars
  (name: string): string => 'Int', // eslint-disable-line no-unused-vars
];

const actionInvolvedEntityNames = (
  name: string,
  derivativeKey?: string = '', // eslint-disable-line no-unused-vars
): { [key: string]: string } => ({});

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  derivativeKey?: string,
): null | EntityConfig => {
  const { name } = entityConfig;

  const { allEntityConfigs, derivative } = generalConfig;

  const connectionConfigName = `${name}Connection`;

  const connectionConfig = allEntityConfigs[connectionConfigName];

  if (derivativeKey) {
    return derivative
      ? composeDerivativeConfig(derivative[derivativeKey], connectionConfig, generalConfig)
      : null;
  }

  return connectionConfig;
};

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'embedded' || entityConfig.type === 'file';

const actionIsChild = 'Array';

const actionReturnString = ({ name }: EntityConfig, derivativeKey?: string = ''): string =>
  `${name}${derivativeKey}Connection`;

const arrayEntitiesThroughConnectionQueryAttributes = {
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
  actionIsChild,
};

export default arrayEntitiesThroughConnectionQueryAttributes;
