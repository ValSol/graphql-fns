// @flow

const composeCommonUseTypes = (): Array<string> => [
  'scalar DateTime',
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
