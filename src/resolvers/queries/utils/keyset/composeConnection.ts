type Connection = {
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
  edges: Array<{
    node: any;
    cursor: string;
  }>;
};

const composeConnection = (
  nodes: any[],
  toNodeCursor: (node: any) => string,
  { hasNextPage, hasPreviousPage }: { hasNextPage: boolean; hasPreviousPage: boolean },
): Connection => {
  const edges = nodes.map((node) => ({ node, cursor: toNodeCursor(node) }));

  const pageInfo: Connection['pageInfo'] = { hasNextPage, hasPreviousPage };

  if (edges.length > 0) {
    pageInfo.startCursor = edges[0].cursor;
    pageInfo.endCursor = edges[edges.length - 1].cursor;
  }

  return { pageInfo, edges };
};

export default composeConnection;
