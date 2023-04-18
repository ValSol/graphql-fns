import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import createFileWhereInputType from '../inputs/createFileWhereInputType';

const actionType = 'Query';

const actionGeneralName = (descendantKey: string = ''): string => `entityFiles${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `${baseName}Files${descendantKey}`;

const inputCreators = [createFileWhereInputType];

const argNames = ['where'];

const argTypes = [(name: string): string => 'FileWhereInput']; // eslint-disable-line no-unused-vars

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
): null | EntityConfig =>
  descendantKey
    ? composeDescendantConfigByName(descendantKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangibleFile';

const actionReturnString = ({ name }: EntityConfig, descendantKey: string = ''): string =>
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
