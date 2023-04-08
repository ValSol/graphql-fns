import type { VirtualEntityConfig } from '../../tsTypes';

const pageInfoConfig: VirtualEntityConfig = {
  name: 'PageInfo',
  type: 'virtual',

  booleanFields: [
    { name: 'hasNextPage', required: true },
    { name: 'hasPreviousPage', required: true },
  ],

  textFields: [{ name: 'startCursor' }, { name: 'endCursor' }],
};

export default pageInfoConfig;
