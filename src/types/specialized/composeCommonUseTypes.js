// @flow

const composeCommonUseTypes = (): Array<string> => [
  'scalar DateTime',
  `input RegExp {
  pattern: String!
  flags: String
}`,
];

export default composeCommonUseTypes;
