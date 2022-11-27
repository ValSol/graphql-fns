// @flow

import type { LookupMongodb, EntityConfig } from '../../../flowTypes';

import addFilter from './addFilter';
import composeWhereInput from './composeWhereInput';

const mergeWhereAndFilter = (
  filter: Array<Object>,
  where: Object,
  entityConfig: EntityConfig,
  notCreateObjectId?: boolean,
): { where: Object, lookups: Array<LookupMongodb> } =>
  composeWhereInput(addFilter(filter, where), entityConfig, notCreateObjectId);

export default mergeWhereAndFilter;
