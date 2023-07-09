import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import createFileWhereInputType from '../inputs/createFileWhereInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Query';

const actionGeneralName = (descendantKey = ''): string => `entityFileCount${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `${baseName}FileCount${descendantKey}`;

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
  // eslint-disable-line no-unused-vars
  entityConfig: EntityConfig,
  // eslint-disable-line no-unused-vars
  generalConfig: GeneralConfig,
  // eslint-disable-line no-unused-vars
  descendantKey?: string,
): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  Boolean(entityConfig.type === 'tangibleFile');

const actionReturnString = (
  // eslint-disable-next-line no-unused-vars
  entityConfig: EntityConfig,
  // eslint-disable-next-line no-unused-vars
  descendantKey: string,
): string => 'Int!';

const entityFileCountQueryAttributes = {
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

export default entityFileCountQueryAttributes;
