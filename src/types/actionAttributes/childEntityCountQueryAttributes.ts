import type { EntityConfig } from '../../tsTypes';

import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';

const actionType = 'Query';

const actionGeneralName = (descendantKey = ''): string => `childEntityCount${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `child${baseName}Count${descendantKey}`;

const inputCreators = [createEntityWhereInputType, createStringInputTypeForSearch];

const argNames = ['where', 'search'];

const argTypes = [({ name }): string => `${name}WhereInput`, (): string => 'String'];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey = '',
): {
  [key: string]: string;
} => ({ inputOutputEntity: `${name}${descendantKey}` });

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
