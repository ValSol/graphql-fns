import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createPushIntoEntityInputType from '../inputs/createPushIntoEntityInputType';
import createEntityPushPositionsInputType from '../inputs/createEntityPushPositionsInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (descendantKey = ''): string => `pushIntoEntity${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `pushInto${baseName}${descendantKey}`;

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
  descendantKey = '',
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

const actionReturnString = ({ name }: EntityConfig, descendantKey = ''): string =>
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
