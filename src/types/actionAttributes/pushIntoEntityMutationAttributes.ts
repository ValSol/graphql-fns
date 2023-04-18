import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createPushIntoEntityInputType from '../inputs/createPushIntoEntityInputType';
import createEntityPushPositionsInputType from '../inputs/createEntityPushPositionsInputType';

const actionType = 'Mutation';

const actionGeneralName = (descendantKey: string = ''): string => `pushIntoEntity${descendantKey}`;

const actionName = (baseName: string, descendantKey: string = ''): string =>
  `pushInto${baseName}${descendantKey}`;

const inputCreators = [
  createEntityWhereOneInputType,
  createPushIntoEntityInputType,
  createEntityPushPositionsInputType,
];

const argNames = ['whereOne', 'data', 'positions'];

const argTypes = [
  (name: string): string => `${name}WhereOneInput!`,
  (name: string): string => `PushInto${name}Input!`,
  (name: string): string => `${name}PushPositionsInput`,
];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey: string = '',
): {
  [key: string]: string;
} => ({
  inputOutputEntity: `${name}${descendantKey}`,
  subscribeUpdatedEntity: name,
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
  entityConfig.type === 'tangible' && Boolean(createPushIntoEntityInputType(entityConfig)[1]);

const actionReturnString = ({ name }: EntityConfig, descendantKey: string = ''): string =>
  `${name}${descendantKey}!`;

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
