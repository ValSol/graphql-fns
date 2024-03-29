import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import createFileWhereInputType from '../inputs/createFileWhereInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Query';

const actionGeneralName = (descendantKey = ''): string => `entityFiles${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `${baseName}Files${descendantKey}`;

const inputCreators = [createFileWhereInputType, createStringInputType];

const argNames = ['where', 'token'];

const argTypes = [(): string => 'FileWhereInput', (): string => 'String'];

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
): null | EntityConfig =>
  descendantKey
    ? composeDescendantConfigByName(descendantKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangibleFile';

const actionReturnString = ({ name }: EntityConfig, descendantKey = ''): string =>
  `[${name}${descendantKey}!]!`;

const entityFilesQueryAttributes = {
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

export default entityFilesQueryAttributes;
