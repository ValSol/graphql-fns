import type {
  ActionAttributes,
  DescendantAttributesActionName,
  EntityConfig,
  GeneralConfig,
} from '../tsTypes';

import checkDescendantAction from '../utils/checkDescendantAction';
import composeDescendantConfigByName from '../utils/composeDescendantConfigByName';
import fillInputDic from './inputs/fillInputDic';
import fillEntityTypeDic from './fillEntityTypeDic';

const composeActionSignature = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  actionAttributes: ActionAttributes,
  entityTypeDic: { [entityName: string]: string },
  inputDic: { [inputName: string]: string },
  descendantKey = '',
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
    !checkDescendantAction(
      actionGeneralName('') as DescendantAttributesActionName,
      entityConfig,
      generalConfig,
    )
  ) {
    return '';
  }

  const specificName = actionName(configName, descendantKey);

  const toShow: Array<boolean> = [];

  const entityConfigForInputCreator = descendantKey
    ? composeDescendantConfigByName(descendantKey, entityConfig, generalConfig)
    : entityConfig;

  inputCreators.forEach((inputCreator) => {
    const [inputName, inputDefinition, childChain] = inputCreator(entityConfigForInputCreator);
    toShow.push(Boolean(inputDefinition));
    if (inputName && !inputDic[inputName] && inputDefinition) {
      inputDic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
      fillInputDic(childChain, inputDic);
    }
  });

  const filteredArgNames = argNames.filter((foo, i) => toShow[i]);
  const filteredArgTypes = argTypes.filter((foo, i) => toShow[i]);

  const returnString = actionReturnString(entityConfig, descendantKey);

  if (filteredArgNames.length === 0) {
    return `  ${specificName}: ${returnString}`;
  }

  const args = filteredArgNames
    .map((argName, i) => `${argName}: ${filteredArgTypes[i](entityConfigForInputCreator)}`)
    .join(', ');

  const returnConfig = actionReturnConfig(entityConfig, generalConfig, descendantKey);

  if (returnConfig) {
    fillEntityTypeDic(returnConfig, generalConfig, entityTypeDic, inputDic);
  }

  return `  ${specificName}(${args}): ${returnString}`;
};

export default composeActionSignature;
