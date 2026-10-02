import type { ActionInvolvedEntityNames, EntityConfig } from '@/tsTypes';

import createEntityWhereAndSearchInputType from '../inputs/createEntityWhereAndSearchInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Query';

const actionGeneralName = (representationKey = ''): string =>
  `entityExistences${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `${baseName}Existences${representationKey}`;

const inputCreators = [createEntityWhereAndSearchInputType, createStringInputType];

const argNames = ['whereAndSearch', 'token'];

const argTypes = [({ name }): string => `[${name}WhereAndSearchInput!]!`, (): string => 'String'];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({ inputOutputEntity: `${name}${representationKey}` });

const actionReturnConfig = (): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = (): string => '[Boolean!]!';

const entityExistencesQueryAttributes = {
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

export default entityExistencesQueryAttributes;
