import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import createEntityWhereCompoundOneInputType from '../inputs/createEntityWhereCompoundOneInputType';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';

import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Query';

const actionGeneralName = (representationKey = ''): string => `entity${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `${baseName}${representationKey}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createEntityWhereCompoundOneInputType,
  createStringInputType,
];

const argNames = ['whereOne', 'whereCompoundOne', 'token'];

const argTypes = [
  ({ name, uniqueCompoundIndexes }): string =>
    `${name}WhereOneInput${uniqueCompoundIndexes ? '' : '!'}`,
  ({ name }): string => `${name}WhereCompoundOneInput`,
  (): string => 'String',
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

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `${name}${representationKey}`;

const entityQueryAttributes = {
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

export default entityQueryAttributes;
