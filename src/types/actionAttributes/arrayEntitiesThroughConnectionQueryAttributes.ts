import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig, InputCreator } from '../../tsTypes';

import composeDescendantConfig from '../../utils/composeDescendantConfig';
import connectionDescendantUpdater from '../actionDescendantUpdaters/connectionDescendantUpdater';

const actionType = 'Query';

const actionGeneralName = (descendantKey: string = ''): string =>
  `childEntitiesThroughConnection${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `child${pluralize(baseName)}ThroughConnection${descendantKey}`;

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
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
  (name: string): string => 'Int', // eslint-disable-line no-unused-vars
  (name: string): string => 'Int', // eslint-disable-line no-unused-vars
];

const actionInvolvedEntityNames = (
  name: string,
  // eslint-disable-line no-unused-vars
  descendantKey: string = '',
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

const actionReturnString = ({ name }: EntityConfig, descendantKey: string = ''): string =>
  `${name}${descendantKey}Connection`;

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
