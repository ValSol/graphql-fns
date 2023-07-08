import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import createFileWhereOneInputType from '../inputs/createFileWhereOneInputType';

const actionType = 'Query';

const actionGeneralName = (descendantKey = ''): string => `entityFile${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `${baseName}File${descendantKey}`;

const inputCreators = [createFileWhereOneInputType];

const argNames = ['whereOne'];

const argTypes = [(name: string): string => 'FileWhereOneInput!']; // eslint-disable-line no-unused-vars

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

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  Boolean(entityConfig.type === 'tangibleFile');

const actionReturnString = ({ name }: EntityConfig, descendantKey = ''): string =>
  `${name}${descendantKey}!`;

const entityFileQueryAttributes = {
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

export default entityFileQueryAttributes;
