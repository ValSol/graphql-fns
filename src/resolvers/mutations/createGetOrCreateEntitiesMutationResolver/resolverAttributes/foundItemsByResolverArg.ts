import type { ResolverArg } from '@/tsTypes';

// "getPrevious" returns only found entities (as "previous"), so it tells "prepareBulkData" (called...
// ... with the same "resolverArg" in the same try) which items are found & which have to be created
const foundItemsByResolverArg = new WeakMap<ResolverArg, boolean[]>();

export default foundItemsByResolverArg;
