import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig, InputCreator } from '../../tsTypes';

import composeDescendantConfig from '../../utils/composeDescendantConfig';
import connectionDescendantUpdater from '../actionDescendantUpdaters/connectionDescendantUpdater';

const actionType = 'Field';

const actionGeneralName = (descendantKey = ''): string =>
  `arrayEntitiesThroughConnection${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `array${pluralize(baseName)}ThroughConnection${descendantKey}`;

const inputCreators = [
  (): [
    string,
    string,
    {
      [inputSpecificName: string]: [InputCreator, EntityConfig];
    },
  ] => ['', 'String', {}],
  (): [
    string,
    string,
    {
      [inputSpecificName: string]: [InputCreator, EntityConfig];
    },
  ] => ['', 'String', {}],
  (): [
    string,
    string,
    {
      [inputSpecificName: string]: [InputCreator, EntityConfig];
    },
  ] => ['', 'Int', {}],
  (): [
    string,
    string,
    {
      [inputSpecificName: string]: [InputCreator, EntityConfig];
    },
  ] => ['', 'Int', {}],
];

const argNames = ['after', 'before', 'first', 'last'];

const argTypes = [
  (): string => 'String',
  (): string => 'String',
  (): string => 'Int',
  (): string => 'Int',
];

const actionInvolvedEntityNames = (
  name: string,
  // eslint-disable-line no-unused-vars
  descendantKey = '',
): {
  [key: string]: string;
} => ({});

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  descendantKey?: string,
): null | EntityConfig => {
  const { name } = entityConfig;

  const { allEntityConfigs, descendant } = generalConfig;

  const connectionConfigName = `${name}Connection`;

  const connectionConfig = allEntityConfigs[connectionConfigName];

  if (descendantKey) {
    return descendant
      ? composeDescendantConfig(descendant[descendantKey], connectionConfig, generalConfig)
      : null;
  }

  return connectionConfig;
};

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'embedded' || entityConfig.type === 'file';

const actionIsChild = 'Array';

const actionReturnString = ({ name }: EntityConfig, descendantKey = ''): string =>
  `${name}${descendantKey}Connection!`;

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
  actionDescendantUpdater: connectionDescendantUpdater,
  actionAllowed,
  actionIsChild,
} as const;

export default arrayEntitiesThroughConnectionQueryAttributes;
