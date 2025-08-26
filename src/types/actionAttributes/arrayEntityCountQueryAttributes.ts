import type { ActionInvolvedEntityNames, EntityConfig } from '@/tsTypes';

const actionType = 'Field';

const actionGeneralName = (descendantKey = ''): string => `arrayEntityCount${descendantKey}`;

const actionName = (baseName: string, descendantKey = ''): string =>
  `array${baseName}Count${descendantKey}`;

const inputCreators = [];

const argNames = [];

const argTypes = [];

const actionInvolvedEntityNames = (
  name: string,
  descendantKey = '',
): ActionInvolvedEntityNames => ({});

const actionReturnConfig = (): null | EntityConfig => null;

const actionAllowed = (entityConfig: EntityConfig): boolean => entityConfig.type === 'embedded';

const actionIsChild = 'Array';

const actionReturnString = (): string => 'Int!';

const arrayEntityCountQueryAttributes = {
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
  actionIsChild,
} as const;

export default arrayEntityCountQueryAttributes;
