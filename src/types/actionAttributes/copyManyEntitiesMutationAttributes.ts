import pluralize from 'pluralize';

import type { ActionInvolvedEntityNames, EntityConfig, GeneralConfig } from '@/tsTypes';

import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import composeCopySourceAndTargetInputCreator from '../inputs/composeCopySourceAndTargetInputCreator';
import createCopyEntityOptionsInputType from '../inputs/createCopyEntityOptionsInputType';
import createEntityWhereKeyToSourceInputType from '../inputs/createEntityWhereKeyToSourceInputType';
import createStringInputType from '../inputs/createStringInputType';

const actionType = 'Mutation';

const actionGeneralName = (representationKey = ''): string =>
  `copyManyEntities${representationKey}`;

const actionName = (baseName: string, representationKey = ''): string =>
  `copyMany${pluralize(baseName)}${representationKey}`;

const sourceAndTargetInputCreator = composeCopySourceAndTargetInputCreator(false, true);

// "sourceAndCompoundTargetAndData" arg (alternative to "sourceAndTargetAndData") is available only...
// ... if X can be copy target & has "uniqueCompoundIndexes"
const sourceAndCompoundTargetInputCreator = composeCopySourceAndTargetInputCreator(true, true);

const inputCreators = [
  sourceAndTargetInputCreator,
  sourceAndCompoundTargetInputCreator,
  createCopyEntityOptionsInputType,
  createStringInputType,
];

const argNames = ['sourceAndTargetAndData', 'sourceAndCompoundTargetAndData', 'options', 'token'];

const argTypes = [
  (entityConfig): string =>
    `[${entityConfig.name}CopySourceAndTargetAndDataInput!]${
      sourceAndCompoundTargetInputCreator(entityConfig)[1] ? '' : '!'
    }`,
  ({ name }): string => `[${name}CopySourceAndCompoundTargetAndDataInput!]`,
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
  Boolean(createEntityWhereKeyToSourceInputType(entityConfig)[1]);

const actionReturnString = ({ name }: EntityConfig, representationKey = ''): string =>
  `[${name}${representationKey}!]!`;

const copyManyEntitiesMutationAttributes = {
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

export default copyManyEntitiesMutationAttributes;
