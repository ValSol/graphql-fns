import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';

const actionType = 'Mutation';

const actionGeneralName = (descendantKey: string = ''): string =>
  `deleteManyEntities${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `deleteMany${pluralize(baseName)}${descendantKey}`;

const inputCreators = [createEntityWhereOneInputType];

const argNames = ['whereOne'];

const argTypes = [(name: string): string => `[${name}WhereOneInput!]!`];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey: string = '',
): {
  [key: string]: string;
} => ({
  inputOutputEntity: `${name}${descendantKey}`,
});

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  descendantKey?: string,
): null | EntityConfig =>
  descendantKey
    ? composeDescendantConfigByName(descendantKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, descendantKey: string = ''): string =>
  `[${name}${descendantKey}!]!`;

const deleteManyEntitiesMutationAttributes = {
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

export default deleteManyEntitiesMutationAttributes;
