import type {
  ActionAttributes,
  RepresentationAttributesActionName,
  EntityConfig,
  GeneralConfig,
} from '../tsTypes';

import checkRepresentationAction from '../utils/checkRepresentationAction';
import composeRepresentationConfigByName from '../utils/composeRepresentationConfigByName';
import fillInputDic from './inputs/fillInputDic';
import fillEntityTypeDic from './fillEntityTypeDic';

const composeActionSignature = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  actionAttributes: ActionAttributes,
  entityTypeDic: { [entityName: string]: string },
  inputDic: { [inputName: string]: string },
  representationKey = '',
): string => {
  const {
    actionAllowed,
    actionIsChild,
    actionGeneralName,
    actionName,
    inputCreators,
    actionReturnConfig,
    argNames,
    argTypes,
    actionReturnString,
  } = actionAttributes;

  const { name: configName } = entityConfig;

  if (actionIsChild || !actionAllowed(entityConfig)) return '';

  if (
    !checkRepresentationAction(
      actionGeneralName('') as RepresentationAttributesActionName,
      entityConfig,
      generalConfig,
    )
  ) {
    return '';
  }

  const specificName = actionName(configName, representationKey);

  const toShow: Array<boolean> = [];

  const entityConfigForInputCreator = representationKey
    ? composeRepresentationConfigByName(representationKey, entityConfig, generalConfig)
    : entityConfig;

  inputCreators.forEach((inputCreator) => {
    const [inputName, inputDefinition, childChain] = inputCreator(entityConfigForInputCreator);
    toShow.push(Boolean(inputDefinition));
    if (inputName && !inputDic[inputName] && inputDefinition) {
      inputDic[inputName] = inputDefinition;
      fillInputDic(childChain, inputDic);
    }
  });

  const filteredArgNames = argNames.filter((foo, i) => toShow[i]);
  const filteredArgTypes = argTypes.filter((foo, i) => toShow[i]);

  const returnString = actionReturnString(entityConfig, representationKey);

  if (filteredArgNames.length === 0) {
    return `  ${specificName}: ${returnString}`;
  }

  const args = filteredArgNames
    .map((argName, i) => `${argName}: ${filteredArgTypes[i](entityConfigForInputCreator)}`)
    .join(', ');

  const returnConfig = actionReturnConfig(entityConfig, generalConfig, representationKey);

  if (returnConfig) {
    fillEntityTypeDic(returnConfig, generalConfig, entityTypeDic, inputDic);
  }

  return `  ${specificName}(${args}): ${returnString}`;
};

export default composeActionSignature;
