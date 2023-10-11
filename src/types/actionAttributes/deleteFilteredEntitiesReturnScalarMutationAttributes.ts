import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (descendantKey = ''): string =>
  `deleteFilteredEntitiesReturnScalar${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `deleteFiltered${pluralize(baseName)}ReturnScalar${descendantKey}`;

const inputCreators = [
  createEntityWhereInputType,
  createStringInputTypeForSearch,
  createStringInputType,
];

const argNames = ['where', 'search', 'token'];

const argTypes = [
  ({ name }): string => `${name}WhereInput`,
  (): string => 'String',
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey = '',
): {
  [key: string]: string;
} => ({
  inputOutputEntity: `${name}${descendantKey}`,
});

const actionReturnConfig = (
  // eslint-disable-line no-unused-vars
  entityConfig: EntityConfig,
  // eslint-disable-line no-unused-vars
  generalConfig: GeneralConfig,
  // eslint-disable-line no-unused-vars
  descendantKey?: string,
): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = (
  // eslint-disable-next-line no-unused-vars
  entityConfig: EntityConfig,
  // eslint-disable-next-line no-unused-vars
  descendantKey: string,
): string => 'Int!';

const deleteFilteredEntitiesReturnScalarMutationAttributes = {
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

export default deleteFilteredEntitiesReturnScalarMutationAttributes;
