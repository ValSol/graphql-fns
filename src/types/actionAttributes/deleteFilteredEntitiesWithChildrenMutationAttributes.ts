import pluralize from 'pluralize';

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import getOppositeFields from '../../utils/getOppositeFields';
import createEntityWhereInputType from '../inputs/createEntityWhereInputType';
import createEntityNearInputType from '../inputs/createEntityNearInputType';
import createStringInputTypeForSearch from '../inputs/createStringInputTypeForSearch';
import createDeleteEntityWithChildrenOptionsInputType from '../inputs/createDeleteEntityWithChildrenOptionsInputType';

const actionType = 'Mutation';

const actionGeneralName = (descendantKey: string = ''): string =>
  `deleteFilteredEntitiesWithChildren${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `deleteFiltered${pluralize(baseName)}WithChildren${descendantKey}`;

const inputCreators = [
  createEntityWhereInputType,
  createEntityNearInputType,
  createStringInputTypeForSearch,
  createDeleteEntityWithChildrenOptionsInputType,
];

const argNames = ['where', 'near', 'search', 'options'];

const argTypes = [
  (name: string): string => `${name}WhereInput`,
  (name: string): string => `${name}NearInput`,
  (): string => 'String',
  (name: string): string => `delete${name}WithChildrenOptionsInput`,
];

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

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' &&
  Boolean(
    getOppositeFields(entityConfig).filter(
      ([, { array, parent }]: [any, any]) => !(array || parent),
    ).length,
  );

const actionReturnString = ({ name }: EntityConfig, descendantKey: string = ''): string =>
  `[${name}${descendantKey}!]!`;

const deleteFilteredEntitiesWithChildrenMutationAttributes = {
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

export default deleteFilteredEntitiesWithChildrenMutationAttributes;
