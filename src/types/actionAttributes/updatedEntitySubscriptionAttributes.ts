import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeDescendantConfigByName from '@/utils/composeDescendantConfigByName';
import createEntityWherePayloadInputType from '../inputs/createEntityWherePayloadInputType';
import createEntityWhichUpdatedInputType from '../inputs/createEntityWhichUpdatedInputType';
import updatedPayloadDescendantUpdater from '../actionDescendantUpdaters/updatedPayloadDescendantUpdater';

const actionType = 'Subscription';

const actionGeneralName = (descendantKey = ''): string => `updatedEntity${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `updated${baseName}${descendantKey}`;

const inputCreators = [createEntityWherePayloadInputType, createEntityWhichUpdatedInputType];

const argNames = ['wherePayload', 'whichUpdated'];

const argTypes = [
  ({ name }): string => `${name}WherePayloadInput`,
  ({ name }): string => `${name}WhichUpdatedInput`,
];

// may will not be in use
const actionInvolvedEntityNames = (
  name: string,
  descendantKey = '',
): ActionInvolvedEntityNames => ({ inputOutputEntity: `${name}${descendantKey}` });

const actionReturnConfig = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  descendantKey?: string,
): null | EntityConfig => {
  const { name } = entityConfig;

  const { allEntityConfigs } = generalConfig;

  const updatedPayloadConfigName = `${name}UpdatedPayload`;

  const updatedPayloadConfig = allEntityConfigs[updatedPayloadConfigName];

  return descendantKey
    ? composeDescendantConfigByName(descendantKey, updatedPayloadConfig, generalConfig)
    : updatedPayloadConfig;
};

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'tangible';

const actionReturnString = ({ name }: EntityConfig, descendantKey = ''): string =>
  `${name}${descendantKey}UpdatedPayload!`;

const updatedEntitySubscriptionAttributes = {
  actionGeneralName,
  actionType,
  actionName,
  inputCreators,
  argNames,
  argTypes,
  actionInvolvedEntityNames,
  actionReturnString,
  actionReturnConfig,
  actionDescendantUpdater: updatedPayloadDescendantUpdater,
  actionAllowed,
} as const;

export default updatedEntitySubscriptionAttributes;
