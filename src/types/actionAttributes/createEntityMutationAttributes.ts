import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeDescendantConfigByName from '../../utils/composeDescendantConfigByName';
import createEntityCreateInputType from '../inputs/createEntityCreateInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (descendantKey = ''): string => `createEntity${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `create${baseName}${descendantKey}`;

const inputCreators = [createEntityCreateInputType, createStringInputType];

const argNames = ['data', 'token'];

const argTypes = [({ name }): string => `${name}CreateInput!`, (): string => 'String'];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey = '',
): {
  [key: string]: string;
} => ({
  inputOutputEntity: `${name}${descendantKey}`,
  subscribeCreatedEntity: name,
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

const actionReturnString = ({ name }: EntityConfig, descendantKey = ''): string =>
  `${name}${descendantKey}!`;

const createEntityMutationAttributes = {
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

export default createEntityMutationAttributes;
