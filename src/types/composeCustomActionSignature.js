// @flow
import type { GeneralConfig, ActionSignatureMethods, EntityConfig } from '../flowTypes';

import composeSpecificActionName from '../utils/composeSpecificActionName';
import fillInputDicForCustom from './inputs/fillInputDicForCustom';
import fillEntityTypeDic from './fillEntityTypeDic';

const composeCustomActionSignature = (
  signatureMethods: ActionSignatureMethods,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  entityTypeDic?: { [entityName: string]: string },
  inputDic?: { [inputName: string]: string },
): string => {
  const {
    name: actionName,
    specificName: composeName,
    argNames: composeArgNames,
    argTypes: composeArgTypes,
    type: composeType,
    config: composeConfig,
  } = signatureMethods;

  const { inventory } = generalConfig;

  const specificName = composeName(entityConfig, generalConfig);

  // by making specificName = '' filter unnecessary action
  if (!specificName) return '';

  // *** test correctness of the specificName name
  const { name: entityName } = entityConfig;
  if (specificName !== composeSpecificActionName({ actionName, entityName })) {
    throw new TypeError(
      `Specific action name: "${specificName}" is not corresponding with generic action name "${actionName}"!`,
    );
  }
  // ***

  const argNames = composeArgNames(entityConfig, generalConfig);
  const argTypes = composeArgTypes(entityConfig, generalConfig);
  const returningType = composeType(entityConfig, generalConfig);

  if (argNames.length !== argTypes.length) {
    throw new TypeError('argNames & argTypes arrays have to have equal length!');
  }

  const args = argNames.map((argName, i) => `${argName}: ${argTypes[i]}`).join(', ');

  if (inputDic && entityTypeDic) {
    argTypes.forEach((argType) => {
      fillInputDicForCustom(argType, generalConfig, inputDic);
    });

    const returnConfig = composeConfig(entityConfig, generalConfig);

    if (returnConfig) {
      fillEntityTypeDic(returnConfig, generalConfig, entityTypeDic, inputDic, inventory);
    }
  }

  return argNames.length
    ? `${specificName}(${args}): ${returningType}`
    : `${specificName}: ${returningType}`;
};

export default composeCustomActionSignature;
