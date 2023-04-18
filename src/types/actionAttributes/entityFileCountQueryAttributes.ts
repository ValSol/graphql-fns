import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import createFileWhereInputType from '../inputs/createFileWhereInputType';

const actionType = 'Query';

const actionGeneralName = (descendantKey: string = ''): string => `entityFileCount${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `${baseName}FileCount${descendantKey}`;

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
