import type { Context } from '../../../tsTypes';

type Args = Record<never, never>;

const fieldFilterStringifiedResolver = (
  parent: any,
  args: Args,
  context: Context,
  info: any,
): any => {
  const { fieldName } = info;

  const filter = parent[`${fieldName.slice(0, -'Stringified'.length)}`];

  return filter;
};

export default fieldFilterStringifiedResolver;
