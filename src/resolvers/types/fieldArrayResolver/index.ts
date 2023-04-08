import type { Context } from '../../../tsTypes';

type Args = {
  slice: {
    begin?: number;
    end?: number;
  };
};

const fieldArrayResolver = (parent: any, args: Args, context: Context, info: any): any => {
  const { fieldName } = info;

  const arr = parent[fieldName];

  if (!arr.length) return [];

  const { slice } = args || {};

  if (!slice) return arr;

  const { begin, end } = slice;

  if (typeof begin === 'number') {
    if (typeof end === 'number') {
      return arr.slice(begin, end);
    }
    return arr.slice(begin);
  }

  if (typeof end === 'number') {
    return arr.slice(0, end);
  }

  return arr;
};

export default fieldArrayResolver;
