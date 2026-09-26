import pluralize from 'pluralize';

import type {
  ActionInvolvedEntityNames,
  EntityConfig,
  GeneralConfig,
  InputCreator,
} from '@/tsTypes';

import canBeCopyTarget from '@/utils/canBeCopyTarget';
import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import getChildDuplexFields from '@/utils/getChildDuplexFields';
import createCopyEntityOptionsInputType from '../inputs/createCopyEntityOptionsInputType';
import createEntityWhereKeyToSourceInputType from '../inputs/createEntityWhereKeyToSourceInputType';
import createEntityWhereOneInputType from '../inputs/createEntityWhereOneInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string =>
  `copyManyEntitiesWithChildren${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `copyMany${pluralize(baseName)}WithChildren${representationKey}`;

// "whereTarget" arg (existing X to copy to) is available only if X can be copy target
const whereTargetInputCreator: InputCreator = (entityConfig) =>
  canBeCopyTarget(entityConfig)
    ? createEntityWhereOneInputType(entityConfig)
    : [`${entityConfig.name}WhereOneInput`, '', {}];

const inputCreators = [
  createEntityWhereKeyToSourceInputType,
  createCopyEntityOptionsInputType,
  whereTargetInputCreator,
  createStringInputType,
];

const argNames = ['whereKeyToSource', 'options', 'whereTarget', 'token'];

const argTypes = [
  ({ name }): string => `[${name}WhereKeyToSourceInput!]!`,
  ({ name }): string => `copy${name}OptionsInput`,
  ({ name }): string => `[${name}WhereOneInput!]`,
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
  Boolean(createEntityWhereKeyToSourceInputType(entityConfig)[1]) &&
  Boolean(getChildDuplexFields(entityConfig).length);

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `[${name}${representationKey}!]!`;

const copyManyEntitiesWithChildrenMutationAttributes = {
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

export default copyManyEntitiesWithChildrenMutationAttributes;
