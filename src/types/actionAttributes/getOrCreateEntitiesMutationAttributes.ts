import pluralize from 'pluralize';

import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import createEntityWhereCompoundOneAndCreateDataInputType from '../inputs/createEntityWhereCompoundOneAndCreateDataInputType';
import createEntityWhereOneAndCreateDataInputType from '../inputs/createEntityWhereOneAndCreateDataInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string =>
  `getOrCreateEntities${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `getOrCreate${pluralize(baseName)}${representationKey}`;

// every item pairs "whereOne" ("whereCompoundOne") of "getOrCreateEntity" with its "data"
const inputCreators = [
  createEntityWhereOneAndCreateDataInputType,
  createEntityWhereCompoundOneAndCreateDataInputType,
  createStringInputType,
];

const argNames = ['whereOneAndData', 'whereCompoundOneAndData', 'token'];

const argTypes = [
  ({ name, uniqueCompoundIndexes }): string =>
    `[${name}WhereOneAndCreateDataInput!]${uniqueCompoundIndexes ? '' : '!'}`,
  ({ name }): string => `[${name}WhereCompoundOneAndCreateDataInput!]`,
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({
  inputOutputEntity: `${name}${representationKey}`,
});

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  representationKey?: string,
): null | EntityConfig =>
  representationKey
    ? composeRepresentationConfigByName(representationKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `[${name}${representationKey}!]!`;

const getOrCreateEntitiesMutationAttributes = {
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

export default getOrCreateEntitiesMutationAttributes;
