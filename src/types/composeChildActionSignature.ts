import type { DescendantAttributesActionName, EntityConfig, GeneralConfig } from '../tsTypes';

import checkDescendantAction from '../utils/checkDescendantAction';
import parseEntityName from '../utils/parseEntityName';
import fillInputDic from './inputs/fillInputDic';
import { queryAttributes } from './actionAttributes';

const composeChildActionSignature = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  childQueryGeneralName: string,
  inputDic?: {
    [inputName: string]: string;
  },
): string => {
  const { actionGeneralName, actionName, inputCreators, argNames, argTypes, actionReturnString } =
    queryAttributes[childQueryGeneralName];
  const { allEntityConfigs } = generalConfig;

  const { root: rootName, descendantKey } = parseEntityName(entityConfig.name, generalConfig);

  if (
    !checkDescendantAction(
      actionGeneralName('') as DescendantAttributesActionName,
      entityConfig,
      generalConfig,
    )
  ) {
    return '';
  }

  const specificName = actionName(rootName, descendantKey);

  const toShow: Array<boolean> = [];

  inputCreators.forEach((inputCreator) => {
    const [inputName, inputDefinition, childChain] = inputCreator(entityConfig);
    toShow.push(Boolean(inputDefinition));
    if (inputDic && inputName && !inputDic[inputName] && inputDefinition) {
      inputDic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
      fillInputDic(childChain, inputDic);
    }
  });

  const filteredArgNames = argNames.filter((foo, i) => toShow[i]);
  const filteredArgTypes = argTypes.filter((foo, i) => toShow[i]);

  const returnString = actionReturnString(allEntityConfigs[rootName], descendantKey);

  if (filteredArgNames.length === 0) {
    return `  ${specificName}: ${returnString}`;
  }

  const args = filteredArgNames
    .map((argName, i) => `${argName}: ${filteredArgTypes[i](entityConfig)}`)
    .join(', ');

  return args;
};

export default composeChildActionSignature;
