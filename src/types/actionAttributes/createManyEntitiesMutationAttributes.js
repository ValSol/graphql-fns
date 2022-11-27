// @flow

import pluralize from 'pluralize';

import type { EntityConfig } from '../../flowTypes';

import createEntityCreateInputType from '../inputs/createEntityCreateInputType';

const actionType = 'Mutation';

const actionGeneralName = (suffix?: string = ''): string => `createManyEntities${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `createMany${pluralize(baseName)}${suffix}`;

const inputCreators = [createEntityCreateInputType];

const argNames = ['data'];

const argTypes = [(name: string): string => `[${name}CreateInput!]!`];

const actionReturnConfig = true;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString =
  (suffix: string): ((entityConfig: EntityConfig) => string) =>
  ({ name }) =>
    `[${name}${suffix}!]!`;

const createManyEntitiesMutationAttributes = {
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

export default createManyEntitiesMutationAttributes;
