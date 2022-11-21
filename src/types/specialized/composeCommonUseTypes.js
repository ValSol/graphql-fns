// @flow

const composeCommonUseTypes = (): Array<string> => [
  'scalar DateTime',
  'scalar Upload',
  `interface Node {
  id: ID!
}`,
  `input RegExp {
  pattern: String!
  flags: String
}`,
  `input SliceInput {
  begin: Int
  end: Int
}`,
  `type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}`,
];

export default composeCommonUseTypes;
