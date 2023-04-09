import type { VirtualEntityConfig } from '../../tsTypes';

const pageInfoConfig: VirtualEntityConfig = {
  name: 'PageInfo',
  type: 'virtual',

  booleanFields: [
    { name: 'hasNextPage', required: true, type: 'booleanFields' },
    { name: 'hasPreviousPage', required: true, type: 'booleanFields' },
  ],

  textFields: [
    { name: 'startCursor', type: 'textFields' },
    { name: 'endCursor', type: 'textFields' },
  ],
};

export default pageInfoConfig;
