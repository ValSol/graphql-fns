import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '../../utils/composeRepresentationConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createPushIntoEntityInputType from '../inputs/createPushIntoEntityInputType';
import createEntityPushPositionsInputType from '../inputs/createEntityPushPositionsInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string => `pushIntoEntity${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `pushInto${baseName}${representationKey}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createPushIntoEntityInputType,
  createEntityPushPositionsInputType,
  createStringInputType,
];

const argNames = ['whereOne', 'data', 'positions', 'token'];

const argTypes = [
  ({ name }): string => `${name}WhereOneInput!`,
  ({ name }): string => `PushInto${name}Input!`,
  ({ name }): string => `${name}PushPositionsInput`,
  (): string => 'String',
];

const actionInvolvedEntityNames = (
  name: string,
  representationKey = '',
): ActionInvolvedEntityNames => ({
  inputOutputEntity: `${name}${representationKey}`,
  subscriptionUpdatedEntity: name, // provide for "name" & all its representations
});

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  representationKey?: string,
): null | EntityConfig =>
  representationKey
    ? composeRepresentationConfigByName(representationKey, entityConfig, generalConfig)
    : entityConfig;

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' && Boolean(createPushIntoEntityInputType(entityConfig)[1]);

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `${name}${representationKey}!`;

const pushIntoEntityMutationAttributes = {
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

export default pushIntoEntityMutationAttributes;
