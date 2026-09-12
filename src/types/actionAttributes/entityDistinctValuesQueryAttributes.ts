import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createEntityDistinctValuesOptionsInputType from '../inputs/createEntityDistinctValuesOptionsInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Query';

const actionGeneralName = (representationKey = ''): string =>
  `entityDistinctValues${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `${baseName}DistinctValues${representationKey}`;

const inputCreators = [
  createEntityWhereInputType,
  createStringInputTypeForSearch,
  createEntityDistinctValuesOptionsInputType,
  createStringInputType,
];

const argNames = ['where', 'search', 'options', 'token'];

const argTypes = [
  ({ name }): string => `${name}WhereInput`,
  (): string => 'String',
  ({ name }): string => `${name}DistinctValuesOptionsInput!`,
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({ inputOutputEntity: `${name}${representationKey}` });

const actionReturnConfig = (): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' &&
  Boolean(createEntityDistinctValuesOptionsInputType(entityConfig)[1]);

const actionReturnString = (): string => '[String!]!';

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
