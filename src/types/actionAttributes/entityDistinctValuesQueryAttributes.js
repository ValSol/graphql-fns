// @flow

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntityDistinctValuesOptionsInputType from '../inputs/createEntityDistinctValuesOptionsInputType';

const actionType = 'Query';

const actionGeneralName = (suffix?: string = ''): string => `entityDistinctValues${suffix}`;

const actionName = (baseName: string, suffix?: string = ''): string =>
  `${baseName}DistinctValues${suffix}`;

const inputCreators = [createEntityWhereInputType, createEntityDistinctValuesOptionsInputType];

const argNames = ['where', 'options'];

const argTypes = [
  (name: string): string => `${name}WhereInput`,
  (name: string): string => `${name}DistinctValuesOptionsInput`,
];

const actionReturnConfig = (
  entityConfig: EntityConfig, // eslint-disable-line no-unused-vars
  generalConfig: GeneralConfig, // eslint-disable-line no-unused-vars
  suffix?: string, // eslint-disable-line no-unused-vars
): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' &&
  Boolean(createEntityDistinctValuesOptionsInputType(entityConfig)[1]);

const actionReturnString =
  (
    // eslint-disable-next-line no-unused-vars
    suffix: string,
  ): ((entityConfig: EntityConfig) => string) =>
  // eslint-disable-next-line no-unused-vars
  ({ name }) =>
    '[String!]!';

const entityDistinctValuesQueryAttributes = {
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

export default entityDistinctValuesQueryAttributes;
