import type {
  ActionInvolvedEntityNames,
  EntityConfig,
  GeneralConfig,
  InputCreator,
} from '@/tsTypes';

import canBeCopyTarget from '@/utils/canBeCopyTarget';
import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import createCopyEntityOptionsInputType from '../inputs/createCopyEntityOptionsInputType';
import createEntityWhereKeyToSourceInputType from '../inputs/createEntityWhereKeyToSourceInputType';
import createEntityUpdateInputType from '../inputs/createEntityUpdateInputType';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string => `copyEntity${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `copy${baseName}${representationKey}`;

// "whereTarget" arg (existing X to copy to) is available only if X can be copy target
const whereTargetInputCreator: InputCreator = (entityConfig) =>
  canBeCopyTarget(entityConfig)
    ? createEntityWhereOneInputType(entityConfig)
    : [`${entityConfig.name}WhereOneInput`, '', {}];

const inputCreators = [
  createEntityWhereKeyToSourceInputType,
  createCopyEntityOptionsInputType,
  whereTargetInputCreator,
  createEntityUpdateInputType,
  createStringInputType,
];

const argNames = ['whereKeyToSource', 'options', 'whereTarget', 'data', 'token'];

const argTypes = [
  ({ name }): string => `${name}WhereKeyToSourceInput!`,
  ({ name }): string => `copy${name}OptionsInput`,
  ({ name }): string => `${name}WhereOneInput`,
  ({ name }): string => `${name}UpdateInput`,
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

const actionAllowed = (entityConfig: EntityConfig): boolean =>
  entityConfig.type === 'tangible' &&
  Boolean(createEntityWhereKeyToSourceInputType(entityConfig)[1]);

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `${name}${representationKey}!`;

const copyEntityMutationAttributes = {
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

export default copyEntityMutationAttributes;
