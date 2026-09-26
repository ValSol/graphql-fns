import type { DuplexField, EntityConfig } from '../tsTypes';

import getOppositeFields from './getOppositeFields';

// "children" of the entity: duplex fields with "parent: true" whose opposite fields are not arrays;...
// ... they are copied by "copy…WithChildren" & deleted by "delete…WithChildren" mutations
const getChildDuplexFields = (entityConfig: EntityConfig): Array<[DuplexField, DuplexField]> =>
  getOppositeFields(entityConfig).filter(([{ parent }, { array }]) => parent && !array);

export default getChildDuplexFields;
