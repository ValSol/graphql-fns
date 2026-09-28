import type { DataObject, InfoEssence, ResolverArg, ResolverCreatorArg } from '@/tsTypes';

import addCalculatedFieldsToEntity from '../addCalculatedFieldsToEntity';
import { attachCalculatedContext } from '../calculatedContext';

// root resolvers calculate the requested calculated fields at once only on explicit request...
// ... ("materializeCalculatedFields" resolver option), otherwise field resolvers calculate them
const prepareCalculatedFields = (
  data: DataObject,
  infoEssence: InfoEssence,
  asyncFuncResults: Record<string, any>,
  resolverArg: ResolverArg,
  resolverCreatorArg: ResolverCreatorArg,
  index: number,
) =>
  resolverArg.resolverOptions?.materializeCalculatedFields
    ? addCalculatedFieldsToEntity(
        data,
        infoEssence,
        asyncFuncResults,
        resolverArg,
        resolverCreatorArg,
        index,
      )
    : attachCalculatedContext(data, { asyncFuncResults, index, resolverArg });

export default prepareCalculatedFields;
