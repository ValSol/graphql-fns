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
    Object.keys(derivative).forEach((derivativeKey) => {
      const { allow } = derivative[derivativeKey];
      Object.keys(allow).forEach((entityName) => {
        allow[entityName].forEach((actionName) => {
          injectDerivativeActionInputs(
            derivativeKey,
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
    // --- check derivativeKeys correctness
    Object.keys(derivativeInputs).forEach((derivativeKey) => {
      if (derivativeKey === '') return;
      if (!derivative || !Object.keys(derivative).includes(derivativeKey)) {
        throw new TypeError(
          `Derivative input derivativeKey: "${derivativeKey}" not used in derivative actions!`,
        );
      }
    });
    // ---

    Object.keys(derivativeInputs).forEach((derivativeKey) => {
      const { allow } = derivativeInputs[derivativeKey];
      Object.keys(allow).forEach((entityName) => {
        allow[entityName].forEach((inputName) => {
          injectDerivativeInput(
            inputName,
            derivativeKey,
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
