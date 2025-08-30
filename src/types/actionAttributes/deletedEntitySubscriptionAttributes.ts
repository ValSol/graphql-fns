import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeDescendantConfigByName from '@/utils/composeDescendantConfigByName';
import createEntityWherePayloadInputType from '../inputs/createEntityWherePayloadInputType';

const actionType = 'Subscription';

const actionGeneralName = (descendantKey = ''): string => `deletedEntity${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `deleted${baseName}${descendantKey}`;

const inputCreators = [createEntityWherePayloadInputType];

const argNames = ['wherePayload'];

const argTypes = [({ name }): string => `${name}WherePayloadInput`];

// may will not be in use
const actionInvolvedEntityNames = (
  name: string,
  descendantKey = '',
): ActionInvolvedEntityNames => ({ inputOutputEntity: `${name}${descendantKey}` });

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

const deletedEntitySubscriptionAttributes = {
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

export default deletedEntitySubscriptionAttributes;
