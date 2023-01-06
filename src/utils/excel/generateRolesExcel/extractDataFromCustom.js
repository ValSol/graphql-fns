// @flow

import type { Custom } from '../../../flowTypes';

type Arg = {
  thingNames: Array<string>,
  custom: Custom,
};

type Result = {
  customActionNames: Array<string>,
  customActionTypes: { [actionName: string]: string }, // 'CustomQuery' | 'CustomMutation'
  thingNamesByCustomActions: { [actionName: string]: Array<string> },
};

const extractDataFromCustom = (arg: Arg): Result => {
  const { thingNames, custom } = arg;

  const customActionNames = [];
  const customActionTypes = {};
  const thingNamesByCustomActions = {};

  if (custom.Query) {
    Object.keys(custom.Query).forEach((key) => {
      // $FlowFixMe
      const { name: actionName, specificName } = custom.Query[key];
      customActionNames.push(actionName);
      customActionTypes[actionName] = 'CustomQuery';
      thingNamesByCustomActions[actionName] = [];

      thingNames.forEach((name) => {
        // $FlowFixMe
        if (specificName({ name })) {
          thingNamesByCustomActions[actionName].push(name);
        }
      });
    });
  }

  if (custom.Mutation) {
    Object.keys(custom.Mutation).forEach((key) => {
      // $FlowFixMe
      const { name: actionName, specificName } = custom.Mutation[key];
      customActionNames.push(actionName);
      customActionTypes[actionName] = 'CustomMutation';
      thingNamesByCustomActions[actionName] = [];

      thingNames.forEach((name) => {
        // $FlowFixMe
        if (specificName({ name })) {
          thingNamesByCustomActions[actionName].push(name);
        }
      });
    });
  }

  return { customActionNames, customActionTypes, thingNamesByCustomActions };
};

export default extractDataFromCustom;
