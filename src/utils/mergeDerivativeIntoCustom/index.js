// @flow
import type { Custom, GeneralConfig } from '../../flowTypes';

import composeDerivativeThingQuery from './composeDerivativeThingQuery';
import composeDerivativeThingsQuery from './composeDerivativeThingsQuery';

const store = {};

const mergeDerivativeIntoCustom = (generalConfig: GeneralConfig): null | Custom => {
  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store.cache) return store.cache;

  const { custom, derivative } = generalConfig;

  if (!derivative) return custom || null;

  const Query = Object.keys(derivative).reduce((prev, suffix) => {
    // eslint-disable-next-line no-param-reassign
    prev[`thing${suffix}`] = composeDerivativeThingQuery(derivative[suffix]);
    // eslint-disable-next-line no-param-reassign
    prev[`things${suffix}`] = composeDerivativeThingsQuery(derivative[suffix]);

    return prev;
  }, {});

  if (!custom) {
    store.cache = { Query };
  } else {
    store.cache = { ...custom, Query: { ...Query, ...custom.Query } };
  }

  return store.cache;
};

export default mergeDerivativeIntoCustom;
