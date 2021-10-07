// @flow

const composeCommonUseTypes = (): Array<string> => [
  'scalar DateTime',
  'scalar Upload',
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
