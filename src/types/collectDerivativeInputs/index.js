// @flow

import type { GeneralConfig } from '../../flowTypes';

import actionAttributes from '../actionAttributes';
import injectDerivativeActionInputs from './injectDerivativeActionInputs';

type CollectDerivativeInputs = (
  generalConfig: GeneralConfig,
  dic: { [inputName: string]: string },
) => void;

const collectDerivativeInputs: CollectDerivativeInputs = (generalConfig, dic) => {
  const { thingConfigs, derivative } = generalConfig;

  if (!derivative) return;

  Object.keys(derivative).forEach((suffix) => {
    const { allow } = derivative[suffix];
    Object.keys(allow).forEach((thingName) => {
      allow[thingName].forEach((actionName) => {
        injectDerivativeActionInputs(
          suffix,
          thingConfigs[thingName],
          generalConfig,
          actionAttributes[actionName],
          dic,
        );
      });
    });
  });
};

export default collectDerivativeInputs;
