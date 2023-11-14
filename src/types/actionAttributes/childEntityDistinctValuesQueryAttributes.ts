import type { EntityConfig } from '../../tsTypes';

import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createEntityDistinctValuesOptionsInputType from '../inputs/createEntityDistinctValuesOptionsInputType';

const actionType = 'Query';

const actionGeneralName = (descendantKey = ''): string =>
  `childEntityDistinctValues${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `child${baseName}DistinctValues${descendantKey}`;

const inputCreators = [
  createEntityWhereInputType,
  createStringInputTypeForSearch,
  createEntityDistinctValuesOptionsInputType,
];

const argNames = ['where', 'search', 'options'];

const argTypes = [
  ({ name }): string => `${name}WhereInput`,
  (): string => 'String',
  ({ name }): string => `${name}DistinctValuesOptionsInput!`,
];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey = '',
): {
  [key: string]: string;
} => ({ inputOutputEntity: `${name}${descendantKey}` });

const actionReturnConfig = (): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' &&
  Boolean(createEntityDistinctValuesOptionsInputType(entityConfig)[1]);

const actionIsChild = 'Array';

const actionReturnString = (): string => '[String!]!';

const childEntityDistinctValuesQueryAttributes = {
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
  actionIsChild,
} as const;

export default childEntityDistinctValuesQueryAttributes;
