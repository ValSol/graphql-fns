import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Query';

const actionGeneralName = (descendantKey = ''): string => `entityCount${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `${baseName}Count${descendantKey}`;

const inputCreators = [
  createEntityWhereInputType,
  createEntityNearInputType,
  createStringInputTypeForSearch,
  createStringInputType,
];

const argNames = ['where', 'near', 'search', 'token'];

const argTypes = [
  ({ name }): string => `${name}WhereInput`,
  ({ name }): string => `${name}NearInput`,
  (): string => 'String',
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey = '',
): {
  [key: string]: string;
} => ({ inputOutputEntity: `${name}${descendantKey}` });

const actionReturnConfig = (): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = (): string => 'Int!';

const entityCountQueryAttributes = {
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

export default entityCountQueryAttributes;
