import pluralize from 'pluralize';

import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import getChildDuplexFields from '@/utils/getChildDuplexFields';
import composeCopySourceAndTargetInputCreator from '../inputs/composeCopySourceAndTargetInputCreator';
import createCopyEntityOptionsInputType from '../inputs/createCopyEntityOptionsInputType';
import createEntityWhereKeyToSourceInputType from '../inputs/createEntityWhereKeyToSourceInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string =>
  `copyManyEntitiesWithChildren${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `copyMany${pluralize(baseName)}WithChildren${representationKey}`;

const sourceAndTargetInputCreator = composeCopySourceAndTargetInputCreator(false, false);

// "sourceAndCompoundTarget" arg (alternative to "sourceAndTarget") is available only...
// ... if X can be copy target & has "uniqueCompoundIndexes"
const sourceAndCompoundTargetInputCreator = composeCopySourceAndTargetInputCreator(true, false);

const inputCreators = [
  sourceAndTargetInputCreator,
  sourceAndCompoundTargetInputCreator,
  createCopyEntityOptionsInputType,
  createStringInputType,
];

const argNames = ['sourceAndTarget', 'sourceAndCompoundTarget', 'options', 'token'];

const argTypes = [
  (entityConfig): string =>
    `[${entityConfig.name}CopySourceAndTargetInput!]${
      sourceAndCompoundTargetInputCreator(entityConfig)[1] ? '' : '!'
    }`,
  ({ name }): string => `[${name}CopySourceAndCompoundTargetInput!]`,
  ({ name }): string => `copy${name}OptionsInput`,
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
