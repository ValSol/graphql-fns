import type { Context } from '../../../tsTypes';

type Args = Record<never, never>;

const fieldArrayCountResolver = (parent: any, args: Args, context: Context, info: any): any => {
  const { fieldName } = info;

  const wholeArray = parent[`${fieldName.slice(0, -'Count'.length)}`];

  return wholeArray.length;
};

export default fieldArrayCountResolver;
