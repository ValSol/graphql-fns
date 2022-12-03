// @flow

import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import composeDerivativeConfigByName from '../../utils/composeDerivativeConfigByName';
import getOppositeFields from '../../utils/getOppositeFields';
import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createDeleteEntityWithChildrenOptionsInputType from '../inputs/createDeleteEntityWithChildrenOptionsInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string =>
  `deleteFilteredEntitiesWithChildren${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `deleteFiltered${pluralize(baseName)}WithChildren${suffix}`;

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
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  suffix?: string,
): null | EntityConfig =>
  suffix ? composeDerivativeConfigByName(suffix, entityConfig, generalConfig) : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' &&
  Boolean(
    getOppositeFields(entityConfig).filter(([, { array, parent }]) => !(array || parent)).length,
  );

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `[${name}${suffix}!]!`;

const deleteFilteredEntitiesWithChildrenMutationAttributes = {
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

export default deleteFilteredEntitiesWithChildrenMutationAttributes;
