import type { ActionInvolvedEntityNames, EntityConfig } from '@/tsTypes';

import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

const actionType = 'Query';

const actionGeneralName = (representationKey = ''): string =>
  `childEntityCount${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `child${baseName}Count${representationKey}`;

const inputCreators = [createEntityWhereInputType, createStringInputTypeForSearch];

const argNames = ['where', 'search'];

const argTypes = [({ name }): string => `${name}WhereInput`, (): string => 'String'];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({ inputOutputEntity: `${name}${representationKey}` });

const actionReturnConfig = (): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionIsChild = 'Array'; // TODO check if correct value is "Array"

const actionReturnString = (): string => 'Int!';

const childEntityCountQueryAttributes = {
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

export default childEntityCountQueryAttributes;
