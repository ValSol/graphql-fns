// @flow

import type { GeneralConfig } from '../../flowTypes';

import actionAttributes from '../actionAttributes';
import injectDerivativeActionInputs from './injectDerivativeActionInputs';
import injectDerivativeInput from './injectDerivativeInput';

type CollectDerivativeInputs = (
  generalConfig: GeneralConfig,
  dic: { [inputName: string]: string },
) => void;

const collectDerivativeInputs: CollectDerivativeInputs = (generalConfig, dic) => {
  const { allEntityConfigs, derivative, derivativeInputs } = generalConfig;

  if (derivative) {
    Object.keys(derivative).forEach((suffix) => {
      const { allow } = derivative[suffix];
      Object.keys(allow).forEach((entityName) => {
        allow[entityName].forEach((actionName) => {
          injectDerivativeActionInputs(
            suffix,
            allEntityConfigs[entityName],
            generalConfig,
            actionAttributes[actionName],
            dic,
          );
        });
      });
    });
  }

  if (derivativeInputs) {
    // --- check suffixes correctness
    Object.keys(derivativeInputs).forEach((suffix) => {
      if (suffix === '') return;
      if (!derivative || !Object.keys(derivative).includes(suffix)) {
        throw new TypeError(`Derivative input suffix: "${suffix}" not used in derivative actions!`);
      }
    });
    // ---

    Object.keys(derivativeInputs).forEach((suffix) => {
      const { allow } = derivativeInputs[suffix];
      Object.keys(allow).forEach((entityName) => {
        allow[entityName].forEach((inputName) => {
          injectDerivativeInput(
            inputName,
            suffix,
            allEntityConfigs[entityName],
            generalConfig,
            dic,
          );
        });
      });
    });
  }
};

export default collectDerivativeInputs;
