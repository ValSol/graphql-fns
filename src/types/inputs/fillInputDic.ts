import type { InputCreator, EntityConfig } from '../../tsTypes';

type ChildChain = {
  [inputSpecificName: string]: [InputCreator, EntityConfig];
};
type FillDic = (childChain: ChildChain, inputDic: { [inputName: string]: string }) => void;

const fillInputDic: FillDic = (childChain, inputDic) => {
  Object.keys(childChain).forEach((inputName) => {
    if (!inputDic[inputName]) {
      const [inputCreator, entityConfig] = childChain[inputName];
      const [inputName2, inputDefinition, childChain2] = inputCreator(entityConfig);
      if (inputName2 && !inputDic[inputName2] && inputDefinition) {
        inputDic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
        fillInputDic(childChain2, inputDic);
      }
    }
  });
};

export default fillInputDic;
