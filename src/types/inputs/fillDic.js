// @flow

import type { InputCreator, ThingConfig } from '../../flowTypes';

type ChildChain = { [inputSpecificName: string]: [InputCreator, ThingConfig] };
type FillDic = (childChain: ChildChain, dic: { [inputName: string]: string }) => void;

const fillDic: FillDic = (childChain, dic) => {
  Object.keys(childChain).forEach((inputName) => {
    if (!dic[inputName]) {
      const [inputCreator, thingConfig] = childChain[inputName];
      const [inputName2, inputDefinition, childChain2] = inputCreator(thingConfig);
      if (inputName2 && !dic[inputName2] && inputDefinition) {
        dic[inputName] = inputDefinition; // eslint-disable-line no-param-reassign
        fillDic(childChain2, dic);
      }
    }
  });
};

export default fillDic;
