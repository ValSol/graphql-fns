// @flow
import type { Custom, GeneralConfig } from '../../flowTypes';

import composeDerivativeThingQuery from './composeDerivativeThingQuery';
import composeDerivativeThingsQuery from './composeDerivativeThingsQuery';
import composeDerivativePushIntoThingMutation from './composeDerivativePushIntoThingMutation';

const store = {};

const mergeDerivativeIntoCustom = (generalConfig: GeneralConfig): null | Custom => {
  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store.cache) return store.cache;

  const { custom, derivative } = generalConfig;

  if (!derivative) return custom || null;

  const Query = Object.keys(derivative).reduce((prev, suffix) => {
    const { allow } = derivative[suffix];
    if (allow.thing) {
      // eslint-disable-next-line no-param-reassign
      prev[`thing${suffix}`] = composeDerivativeThingQuery(derivative[suffix]);
    }
    if (allow.things) {
      // eslint-disable-next-line no-param-reassign
      prev[`things${suffix}`] = composeDerivativeThingsQuery(derivative[suffix]);
    }

    return prev;
  }, {});

  const Mutation = Object.keys(derivative).reduce((prev, suffix) => {
    const { allow } = derivative[suffix];
    if (allow.pushIntoThing) {
      // eslint-disable-next-line no-param-reassign
      prev[`pushIntoThing${suffix}`] = composeDerivativePushIntoThingMutation(derivative[suffix]);
    }
    return prev;
  }, {});

  // TODO Input that take into account the changes in derivative config
  // ----
  // const Input = Object.keys(derivative).reduce((prev, suffix) => {
  //   const { allow } = derivative[suffix];
  //   if (allow.pushIntoThing) {
  //     // eslint-disable-next-line no-param-reassign
  //     prev[`PushIntoThing${suffix}Input`] = composeDerivativePushIntoThingInput(derivative[suffix]);
  //   }
  //   return prev;
  // }, {});

  if (!custom) {
    store.cache = { Query, Mutation /* Input */ };
  } else {
    store.cache = {
      ...custom,
      Query: { ...Query, ...custom.Query },
      Mutation: { ...Mutation, ...custom.Mutation },
      // Input: { ...Input, ...custom.Input },
    };
  }

  return store.cache;
};

export default mergeDerivativeIntoCustom;
