import type { ActionInvolvedEntityNames, EntityConfig } from '@/tsTypes';

import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntityRestrictedWhereAndTargetInputType from '../inputs/createEntityRestrictedWhereAndTargetInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Query';

const actionGeneralName = (representationKey = ''): string =>
  `entityManyDistinctValues${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `${baseName}ManyDistinctValues${representationKey}`;

const inputCreators = [
  createEntityWhereInputType,
  createEntityRestrictedWhereAndTargetInputType,
  createStringInputTypeForSearch,
  createStringInputType,
];

const argNames = ['where', 'restrictedWhereAndTarget', 'search', 'token'];

const argTypes = [
  ({ name }): string => `${name}WhereInput`,
  ({ name }): string => `[${name}RestrictedWhereAndTargetInput!]!`,
  (): string => 'String',
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({ inputOutputEntity: `${name}${representationKey}` });

const actionReturnConfig = (): null | EntityConfig => null;

// allowed for the same entities as "entityDistinctValues" (that have targets)
const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' &&
  Boolean(createEntityRestrictedWhereAndTargetInputType(entityConfig)[1]);

const actionReturnString = (): string => '[[String!]!]!';

const entityManyDistinctValuesQueryAttributes = {
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

export default entityManyDistinctValuesQueryAttributes;
