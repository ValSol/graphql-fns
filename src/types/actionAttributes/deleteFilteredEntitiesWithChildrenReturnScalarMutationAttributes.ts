import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import getOppositeFields from '../../utils/getOppositeFields';
import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createDeleteEntityWithChildrenOptionsInputType from '../inputs/createDeleteEntityWithChildrenOptionsInputType';

const actionType = 'Mutation';

const actionGeneralName = (descendantKey: string = ''): string =>
  `deleteFilteredEntitiesWithChildrenReturnScalar${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `deleteFiltered${pluralize(baseName)}WithChildrenReturnScalar${descendantKey}`;

const inputCreators = [
  createEntityWhereInputType,
  createEntityNearInputType,
  createStringInputTypeForSearch,
  createDeleteEntityWithChildrenOptionsInputType,
];

const argNames = ['where', 'near', 'search', 'options'];

const argTypes = [
  (name: string): string => `${name}WhereInput`,
  (name: string): string => `${name}NearInput`,
  (): string => 'String',
  (name: string): string => `delete${name}WithChildrenOptionsInput`,
];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey: string = '',
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

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' &&
  Boolean(
    getOppositeFields(entityConfig).filter(
      ([, { array, parent }]: [any, any]) => !(array || parent),
    ).length,
  );

const actionReturnString = (
  // eslint-disable-next-line no-unused-vars
  entityConfig: EntityConfig,
  // eslint-disable-next-line no-unused-vars
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
