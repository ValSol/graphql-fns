import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import getOppositeFields from '../../utils/getOppositeFields';
import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createDeleteEntityWithChildrenOptionsInputType from '../inputs/createDeleteEntityWithChildrenOptionsInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (descendantKey = ''): string =>
  `deleteFilteredEntitiesWithChildrenReturnScalar${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `deleteFiltered${pluralize(baseName)}WithChildrenReturnScalar${descendantKey}`;

const inputCreators = [
  createEntityWhereInputType,
  createStringInputTypeForSearch,
  createDeleteEntityWithChildrenOptionsInputType,
  createStringInputType,
];

const argNames = ['where', 'search', 'options', 'token'];

const argTypes = [
  ({ name }): string => `${name}WhereInput`,
  (): string => 'String',
  ({ name }): string => `delete${name}WithChildrenOptionsInput`,
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
  entityConfig: EntityConfig,

  generalConfig: GeneralConfig,

  descendantKey?: string,
): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' &&
  Boolean(
    getOppositeFields(entityConfig).filter(
      ([, { array, parent }]: [any, any]) => !(array || parent),
    ).length,
  );

const actionReturnString = (
  entityConfig: EntityConfig,

  descendantKey: string,
): string => 'Int!';

const deleteFilteredEntitiesWithChildrenReturnScalarMutationAttributes = {
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

export default deleteFilteredEntitiesWithChildrenReturnScalarMutationAttributes;
