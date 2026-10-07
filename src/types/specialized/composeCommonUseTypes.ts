const composeCommonUseTypes = (): Array<string> => [
  'scalar DateTime',
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
];

export default composeCommonUseTypes;
