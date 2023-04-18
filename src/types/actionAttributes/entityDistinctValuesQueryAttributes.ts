import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntityDistinctValuesOptionsInputType from '../inputs/createEntityDistinctValuesOptionsInputType';

const actionType = 'Query';

const actionGeneralName = (descendantKey: string = ''): string =>
  `entityDistinctValues${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `${baseName}DistinctValues${descendantKey}`;

const inputCreators = [createEntityWhereInputType, createEntityDistinctValuesOptionsInputType];

const argNames = ['where', 'options'];

const argTypes = [
  (name: string): string => `${name}WhereInput`,
  (name: string): string => `${name}DistinctValuesOptionsInput`,
];

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
  entityConfig.type === 'tangible' &&
  Boolean(createEntityDistinctValuesOptionsInputType(entityConfig)[1]);

const actionReturnString = (
  // eslint-disable-next-line no-unused-vars
  entityConfig: EntityConfig,
  // eslint-disable-next-line no-unused-vars
  descendantKey: string,
): string => '[String!]!';

const entityDistinctValuesQueryAttributes = {
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

export default entityDistinctValuesQueryAttributes;
