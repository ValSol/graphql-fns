import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeDescendantConfigByName from '@/utils/composeDescendantConfigByName';
import createEntityCreateInputType from '../inputs/createEntityCreateInputType';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';

const actionType = 'Query';

const actionGeneralName = (descendantKey = ''): string => `childEntityGetOrCreate${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `child${baseName}GetOrCreate${descendantKey}`;

const inputCreators = [createEntityWhereOneInputType, createEntityCreateInputType];

const argNames = ['whereOne', 'data'];

const actionArgsToHide = ['whereOne'];

const argTypes = [
  ({ name }): string => `${name}WhereOneInput`,
  ({ name }): string => `${name}CreateInput!`,
];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey = '',
): ActionInvolvedEntityNames => ({ inputOutputEntity: `${name}${descendantKey}` });

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  descendantKey?: string,
): null | EntityConfig =>
  descendantKey
    ? composeDescendantConfigByName(descendantKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionIsChild = 'Scalar';

const actionReturnString = ({ name }: EntityConfig, descendantKey = ''): string =>
  `${name}${descendantKey}`;

const childEntityGetOrCreateQueryAttributes = {
  actionArgsToHide,
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

export default childEntityGetOrCreateQueryAttributes;
