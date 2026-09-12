import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import createEntityCreateInputType from '../inputs/createEntityCreateInputType';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';

const actionType = 'Query';

const actionGeneralName = (representationKey = ''): string =>
  `childEntityGetOrCreate${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `child${baseName}GetOrCreate${representationKey}`;

const inputCreators = [createEntityWhereOneInputType, createEntityCreateInputType];

const argNames = ['whereOne', 'data'];

const actionArgsToHide = ['whereOne'];

const argTypes = [
  ({ name }): string => `${name}WhereOneInput`,
  ({ name }): string => `${name}CreateInput!`,
];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({ inputOutputEntity: `${name}${representationKey}` });

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  representationKey?: string,
): null | EntityConfig =>
  representationKey
    ? composeRepresentationConfigByName(representationKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionIsChild = 'Scalar';

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `${name}${representationKey}`;

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
