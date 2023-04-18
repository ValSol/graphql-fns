import type { EntityConfig, GeneralConfig, InputCreator } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import createFileWhereInputType from '../inputs/createFileWhereInputType';
import connectionDescendantUpdater from '../actionDescendantUpdaters/connectionDescendantUpdater';

const actionType = 'Query';

const actionGeneralName = (descendantKey: string = ''): string =>
  `entityFilesThroughConnection${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `${baseName}FilesThroughConnection${descendantKey}`;

const inputCreators = [
  createFileWhereInputType,
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

const argNames = ['where', 'after', 'before', 'first', 'last'];

const argTypes = [
  (name: string): string => 'FileWhereInput', // eslint-disable-line no-unused-vars
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
  (name: string): string => 'String', // eslint-disable-line no-unused-vars
  (name: string): string => 'Int', // eslint-disable-line no-unused-vars
  (name: string): string => 'Int', // eslint-disable-line no-unused-vars
];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey: string = '',
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

const actionReturnString = ({ name }: EntityConfig, descendantKey: string = ''): string =>
  `${name}Connection${descendantKey}`;

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
