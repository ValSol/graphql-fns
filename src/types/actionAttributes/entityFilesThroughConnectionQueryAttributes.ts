import type { EntityConfig, GeneralConfig, InputCreator } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import createFileWhereInputType from '../inputs/createFileWhereInputType';
import connectionDescendantUpdater from '../actionDescendantUpdaters/connectionDescendantUpdater';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Query';

const actionGeneralName = (descendantKey = ''): string =>
  `entityFilesThroughConnection${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `${baseName}FilesThroughConnection${descendantKey}`;

const inputCreators = [
  createFileWhereInputType,
  createStringInputType,
  createStringInputType,
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
  createStringInputType,
];

const argNames = ['where', 'after', 'before', 'first', 'last', 'token'];

const argTypes = [
  (): string => 'FileWhereInput',
  (): string => 'String',
  (): string => 'String',
  (): string => 'Int',
  (): string => 'Int',
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey = '',
): {
  [key: string]: string;
} => ({ inputOutputEntity: `${name}${descendantKey}` });

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  descendantKey?: string,
): null | EntityConfig => {
  const { name } = entityConfig;

  const { allEntityConfigs } = generalConfig;

  const connectionConfigName = `${name}Connection`;

  const connectionConfig = allEntityConfigs[connectionConfigName];

  return descendantKey
    ? composeDescendantConfigByName(descendantKey, connectionConfig, generalConfig)
    : connectionConfig;
};

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangibleFile';

const actionReturnString = ({ name }: EntityConfig, descendantKey = ''): string =>
  `${name}${descendantKey}Connection!`;

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
  actionDescendantUpdater: connectionDescendantUpdater,
  actionAllowed,
} as const;

export default entityFilesThroughConnectionQueryAttributes;
