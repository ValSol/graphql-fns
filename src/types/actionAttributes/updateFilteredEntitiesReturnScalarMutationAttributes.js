// @flow

import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createEntityUpdateInputType from '../inputs/createEntityUpdateInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string =>
  `updateFilteredEntitiesReturnScalar${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `updateFiltered${pluralize(baseName)}ReturnScalar${suffix}`;

const inputCreators = [
  createEntityWhereInputType,
  createEntityNearInputType,
  createStringInputTypeForSearch,
  createEntityUpdateInputType,
];

const argNames = ['where', 'near', 'search', 'data'];

const argTypes = [
  (name: string): string => `${name}WhereInput`,
  (name: string): string => `${name}NearInput`,
  (): string => 'String',
  (name: string): string => `${name}UpdateInput!`,
];

const actionReturnConfig = (
  entityConfig: EntityConfig, // eslint-disable-line no-unused-vars
  generalConfig: GeneralConfig, // eslint-disable-line no-unused-vars
  suffix?: string, // eslint-disable-line no-unused-vars
): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString =
  (
    // eslint-disable-next-line no-unused-vars
    suffix: string,
  ): ((entityConfig: EntityConfig) => string) =>
  // eslint-disable-next-line no-unused-vars
  ({ name }) =>
    'Int!';

const updateFilteredEntitiesReturnScalarMutationAttributes = {
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

export default updateFilteredEntitiesReturnScalarMutationAttributes;
