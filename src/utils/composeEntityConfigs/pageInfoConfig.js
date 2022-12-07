// @flow
import type { EntityConfig } from '../../flowTypes';

const pageInfoConfig: EntityConfig = {
  name: 'PageInfo',
  type: 'virtual',

  booleanFields: [
    { name: 'hasNextPage', required: true },
    { name: 'hasPreviousPage', required: true },
  ],

  textFields: [{ name: 'startCursor' }, { name: 'endCursor' }],
};

export default pageInfoConfig;
