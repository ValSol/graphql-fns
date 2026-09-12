import type { RepresentationAttributesActionName, EntityConfig, GeneralConfig } from '../tsTypes';

import checkRepresentationAction from '../utils/checkRepresentationAction';
import parseEntityName from '../utils/parseEntityName';
import fillInputDic from './inputs/fillInputDic';
import actionAttributes from './actionAttributes';
import fillEntityTypeDic from './fillEntityTypeDic';

const composeChildActionSignature = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  childQueryGeneralName: string,
  entityTypeDic?: { [entityName: string]: string },
  inputDic?: {
    [inputName: string]: string;
  },
): string => {
  const {
    actionArgsToHide = [],
    actionGeneralName,
    actionName,
    actionType,
    inputCreators,
    argNames,
    argTypes,
    actionReturnConfig,
    actionReturnString,
  } = actionAttributes[childQueryGeneralName];
  const { allEntityConfigs } = generalConfig;

  const { root: rootName, representationKey } = parseEntityName(entityConfig.name, generalConfig);

  if (
    actionType !== 'Field' &&
    !checkRepresentationAction(
      actionGeneralName('') as RepresentationAttributesActionName,
      entityConfig,
      generalConfig,
    )
  ) {
    return '';
  }

  const specificName = actionName(rootName, representationKey);

  const toShow: Array<boolean> = [];

  inputCreators.forEach((inputCreator, i) => {
    const [inputName, inputDefinition, childChain] = inputCreator(entityConfig);

    toShow.push(!actionArgsToHide.includes(argNames[i]) && Boolean(inputDefinition));

    if (inputDic && inputName && !inputDic[inputName] && inputDefinition) {
      inputDic[inputName] = inputDefinition;
      fillInputDic(childChain, inputDic);
    }
  });

  const filteredArgNames = argNames.filter((foo, i) => toShow[i]);
  const filteredArgTypes = argTypes.filter((foo, i) => toShow[i]);

  const returnString = actionReturnString(allEntityConfigs[rootName], representationKey);

  const returnConfig = actionReturnConfig(
    allEntityConfigs[rootName],
    generalConfig,
    representationKey,
  );

  if (returnConfig && entityTypeDic && !entityTypeDic[returnConfig.name]) {
    fillEntityTypeDic(returnConfig, generalConfig, entityTypeDic, inputDic);
  }

  if (filteredArgNames.length === 0) {
    return `  ${specificName}: ${returnString}`;
  }

  const args = filteredArgNames
    .map((argName, i) => `${argName}: ${filteredArgTypes[i](entityConfig)}`)
    .join(', ');

  return args;
};

export default composeChildActionSignature;
