// @flow

import type { ThingConfig } from '../../flowTypes';

type Result = { args1: string, args2: string };

const composeArgs = (thingConfig: ThingConfig, derivativeActionComposer: Function): Result => {
  const fakeDerivativeAction = derivativeActionComposer({ allow: {}, suffix: '' });
  const argNames = fakeDerivativeAction.argNames(thingConfig, { thingConfigs: {} });
  const argTypes = fakeDerivativeAction.argTypes(thingConfig, { thingConfigs: {} });

  const args1 = argNames.map((argName, i) => `$${argName}: ${argTypes[i]}`).join(', ');
  const args2 = argNames.map((argName) => `${argName}: $${argName}`).join(', ');

  return { args1, args2 };
};

export default composeArgs;
