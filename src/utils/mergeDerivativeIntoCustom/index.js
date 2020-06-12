// @flow
import type { Custom, GeneralConfig } from '../../flowTypes';

import composeDerivativeThingQuery from './composeDerivativeThingQuery';
import composeDerivativeThingsQuery from './composeDerivativeThingsQuery';

const mergeDerivativeIntoCustom = (generalConfig: GeneralConfig): null | Custom => {
  const { custom, derivative } = generalConfig;

  if (!derivative) return custom || null;

  const Query = Object.keys(derivative).reduce((prev, suffix) => {
    // eslint-disable-next-line no-param-reassign
    prev[`thing${suffix}`] = composeDerivativeThingQuery(derivative[suffix]);
    // eslint-disable-next-line no-param-reassign
    prev[`things${suffix}`] = composeDerivativeThingsQuery(derivative[suffix]);

    return prev;
  }, {});

  if (!custom) return { Query };

  return { ...custom, Query: { ...Query, ...custom.Query } };
};

export default mergeDerivativeIntoCustom;
