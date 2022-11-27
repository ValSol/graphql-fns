// @flow

import type { DerivativeAttributes } from '../../../flowTypes';

type Arg = {
  actionTypes: { [actionName: string]: 'Query' | 'Mutation' | 'Subscription' },
  derivative: { [suffix: string]: DerivativeAttributes },
};

type Result = {
  derivativeActionNames: Array<string>,
  derivativeActionTypes: { [actionName: string]: string }, // 'DerivativeQuery' | 'DerivativeMutation'
  thingNamesByDerivativeActions: { [actionName: string]: Array<string> },
};

const extractDataFromDerivative = (arg: Arg): Result => {
  const { actionTypes, derivative } = arg;

  const actionNames = [];
  const derivativeActionTypes = {};
  const thingNamesByDerivativeActions = {};

  Object.keys(derivative).forEach((key) => {
    const { allow, suffix } = derivative[key];
    Object.keys(allow).forEach((entityName) => {
      allow[entityName].forEach((actionName) => {
        const derivativeActionName = `${actionName}${suffix}`;
        if (!actionNames.includes(derivativeActionName)) {
          actionNames.push(derivativeActionName);
          derivativeActionTypes[derivativeActionName] = `Derivative${actionTypes[actionName]}`;
          thingNamesByDerivativeActions[derivativeActionName] = [];
        }
        thingNamesByDerivativeActions[derivativeActionName].push(entityName);
      });
    });
  });

  const derivativeActionNames = [
    ...actionNames.filter((actionName) => derivativeActionTypes[actionName] === 'DerivativeQuery'),
    ...actionNames.filter(
      (actionName) => derivativeActionTypes[actionName] === 'DerivativeMutation',
    ),
  ];

  return { derivativeActionNames, derivativeActionTypes, thingNamesByDerivativeActions };
};

export default extractDataFromDerivative;
