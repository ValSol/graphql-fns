// @flow

import type { InputCreator, EntityConfig } from '../../flowTypes';

type ChildChain = { [inputSpecificName: string]: [InputCreator, EntityConfig] };
type FillDic = (childChain: ChildChain, dic: { [inputName: string]: string }) => void;

const fillDic: FillDic = (childChain, dic) => {
  Object.keys(childChain).forEach((inputName) => {
    if (!dic[inputName]) {
      const [inputCreator, entityConfig] = childChain[inputName];
      const [inputName2, inputDefinition, childChain2] = inputCreator(entityConfig);
      if (inputName2 && !dic[inputName2] && inputDefinition) {
        dic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
        fillDic(childChain2, dic);
      }
    }
  });
};

export default fillDic;
