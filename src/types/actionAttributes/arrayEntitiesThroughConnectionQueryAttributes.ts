import pluralize from 'pluralize';

import type {
  ActionInvolvedEntityNames,
  EntityConfig,
  GeneralConfig,
  InputCreator,
} from '@/tsTypes';

import composeRepresentationConfig from '@/utils/composeRepresentationConfig';
import connectionRepresentationUpdater from '../actionRepresentationUpdaters/connectionRepresentationUpdater';

const actionType = 'Field';

const actionGeneralName = (representationKey = ''): string =>
  `arrayEntitiesThroughConnection${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `array${pluralize(baseName)}ThroughConnection${representationKey}`;

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
  representationKey = '',
): ActionInvolvedEntityNames => ({});

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  representationKey?: string,
): null | EntityConfig => {
  const { name } = entityConfig;

  const { allEntityConfigs, representation } = generalConfig;

  const connectionConfigName = `${name}Connection`;

  const connectionConfig = allEntityConfigs[connectionConfigName];

  if (representationKey) {
    return representation
      ? composeRepresentationConfig(
          representation[representationKey],
          connectionConfig,
          generalConfig,
        )
      : null;
  }

  return connectionConfig;
};

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'embedded';

const actionIsChild = 'Array';

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `${name}${representationKey}Connection!`;

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
  actionRepresentationUpdater: connectionRepresentationUpdater,
  actionAllowed,
  actionIsChild,
} as const;

export default arrayEntitiesThroughConnectionQueryAttributes;
