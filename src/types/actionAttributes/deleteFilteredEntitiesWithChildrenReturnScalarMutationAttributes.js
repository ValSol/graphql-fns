// @flow

import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import getOppositeFields from '../../utils/getOppositeFields';
import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createDeleteEntityWithChildrenOptionsInputType from '../inputs/createDeleteEntityWithChildrenOptionsInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string =>
  `deleteFilteredEntitiesWithChildrenReturnScalar${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `deleteFiltered${pluralize(baseName)}WithChildrenReturnScalar${suffix}`;

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

const actionReturnConfig = (
  entityConfig: EntityConfig, // eslint-disable-line no-unused-vars
  generalConfig: GeneralConfig, // eslint-disable-line no-unused-vars
  suffix?: string, // eslint-disable-line no-unused-vars
): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' &&
  Boolean(
    getOppositeFields(entityConfig).filter(([, { array, parent }]) => !(array || parent)).length,
  );

const actionReturnString =
  (
    // eslint-disable-next-line no-unused-vars
    suffix: string,
  ): ((entityConfig: EntityConfig) => string) =>
  // eslint-disable-next-line no-unused-vars
  ({ name }) =>
    'Int!';

const deleteFilteredEntitiesWithChildrenReturnScalarMutationAttributes = {
  actionGeneralName,
  actionType,
  actionName,
  inputCreators,
  argNames,
  argTypes,
  actionReturnString,
  actionReturnConfig,
  actionAllowed,
};

export default deleteFilteredEntitiesWithChildrenReturnScalarMutationAttributes;
