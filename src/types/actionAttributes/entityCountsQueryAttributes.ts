import type { ActionInvolvedEntityNames, EntityConfig } from '@/tsTypes';

import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createStringInputType from '../inputs/createStringInputType';
import createEntityRestrictedWhereInputType from '../inputs/createEntityRestrictedWhereInputType';

const actionType = 'Query';

const actionGeneralName = (representationKey = ''): string => `entityCounts${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `${baseName}Counts${representationKey}`;

const inputCreators = [
  createEntityWhereInputType,
  createEntityRestrictedWhereInputType,
  createStringInputTypeForSearch,
  createStringInputType,
];

const argNames = ['where', 'restrictedWhere', 'search', 'token'];

const argTypes = [
  ({ name }): string => `${name}WhereInput`,
  ({ name }): string => `[${name}RestrictedWhereInput!]!`,
  (): string => 'String',
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({ inputOutputEntity: `${name}${representationKey}` });

const actionReturnConfig = (): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = (): string => '[Int!]!';

const entityCountsQueryAttributes = {
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

export default entityCountsQueryAttributes;
